import {Router, error, withParams} from 'itty-router';
import {handleLatest, handleLatestAll, handleSearch, handleStats} from './routes';

export const router = Router()
  .all('*', withParams)
  .get('/', () => Response.redirect('https://github.com/hampuskraft/discord-build-tracker', 302))
  .get('/stats', handleStats)
  .get('/latest/all', handleLatestAll)
  .get('/latest/:type', handleLatest)
  .get('/search', handleSearch)
  .all('*', () => error(404));
