import { Hono } from "hono";
import { z } from "zod";
import { ReleaseChannel } from "./constants";
import type { BuildRow, EnvVariables } from "./types";
import { handleBuildUpdate } from "./updates";
import { getBuildResponse } from "./utils";

const app = new Hono<{
	Variables: EnvVariables;
	Bindings: { DB: D1Database };
}>();

app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.onError((error, c) => {
	if (error instanceof z.ZodError) {
		return c.json({ error: error.errors }, 400);
	}
	console.error(error);
	return c.json({ error: "Internal Server Error" }, 500);
});

app.get("/_health", (c) => c.text("OK"));
app.get("/", (c) =>
	c.redirect("https://github.com/hampuskraft/discord-build-tracker", 302),
);

app.get("/stats", async (c) => {
	return c.json({
		total: await c.env.DB.prepare("SELECT COUNT(*) AS count FROM builds").first(
			"count",
		),
		stable: await c.env.DB.prepare(
			"SELECT COUNT(*) AS count FROM builds WHERE channel = ?",
		)
			.bind(ReleaseChannel.Stable)
			.first("count"),
		ptb: await c.env.DB.prepare(
			"SELECT COUNT(*) AS count FROM builds WHERE channel = ?",
		)
			.bind(ReleaseChannel.Ptb)
			.first("count"),
		canary: await c.env.DB.prepare(
			"SELECT COUNT(*) AS count FROM builds WHERE channel = ?",
		)
			.bind(ReleaseChannel.Canary)
			.first("count"),
		rollback: await c.env.DB.prepare(
			"SELECT COUNT(*) AS count FROM builds WHERE rollback = 1",
		).first("count"),
	});
});

app.get("/latest/all", async (c) => {
	const stmt = c.env.DB.prepare(
		"SELECT * FROM builds ORDER BY timestamp DESC LIMIT 1",
	);
	const result = await stmt.first<BuildRow>();
	if (!result) {
		return c.json({ error: "No builds found" }, 404);
	}
	return c.json(getBuildResponse(result));
});

app.get("/latest/:type", async (c) => {
	const releaseChannel = z
		.nativeEnum(ReleaseChannel)
		.parse(c.req.param("type"));
	const stmt = c.env.DB.prepare(
		"SELECT * FROM builds WHERE channel = ? ORDER BY timestamp DESC LIMIT 1",
	);
	const result = await stmt.bind(releaseChannel).first<BuildRow>();
	if (!result) {
		return c.json({ error: "No builds found" }, 404);
	}
	return c.json(getBuildResponse(result));
});

const searchQueryRequest = z.object({
	type: z.nativeEnum(ReleaseChannel).optional(),
	before: z.preprocess(Number, z.number().positive().int()).optional(),
	after: z.preprocess(Number, z.number().positive().int()).optional(),
	limit: z
		.preprocess(Number, z.number().int().positive().max(1000))
		.default(100),
	rollback: z
		.enum(["true", "false"])
		.transform((value) => (value === "true" ? 1 : 0))
		.optional(),
});

app.get("/search", async (c) => {
	const params = searchQueryRequest.parse(c.req.query());
	const stmt = c.env.DB.prepare(
		[
			"SELECT * FROM builds",
			params.type || params.before || params.after || params.rollback != null
				? "WHERE 1 = 1"
				: "",
			params.type ? "AND channel = ?" : "",
			params.before ? "AND timestamp < ?" : "",
			params.after ? "AND timestamp > ?" : "",
			params.rollback != null ? "AND rollback = ?" : "",
			"ORDER BY timestamp DESC LIMIT ?",
		]
			.filter((part) => part)
			.join(" "),
	);
	const args = [
		params.type,
		params.before,
		params.after,
		params.rollback,
		params.limit,
	].filter((arg) => arg != null);
	const { results } = await stmt.bind(...args).all<BuildRow>();
	return c.json(results.map(getBuildResponse));
});

export default {
	fetch: app.fetch,
	scheduled: async (_event, env, _ctx) => {
		await handleBuildUpdate(ReleaseChannel.Canary, env);
		await handleBuildUpdate(ReleaseChannel.Ptb, env);
		await handleBuildUpdate(ReleaseChannel.Stable, env);
	},
} satisfies ExportedHandler<EnvVariables & { DB: D1Database }>;
