import { createTerminus } from '@godaddy/terminus'
import config from '../../config/config';

export default function serverConfig(app: any, serverInit: any) {
  function healthCheck() {
    return Promise.resolve();
  }

  function beforeShutdown() {
    return new Promise((resolve) => {
      setTimeout(resolve, 15000);
    });
  }

  async function onShutdown() {
    console.log('cleanup finished, server is shutting down');
  }

  function startServer() {
    createTerminus(serverInit, {
      logger: console.log,
      signal: 'SIGINT',
      healthChecks: {
        '/healthcheck': healthCheck
      },
      onShutdown,
      beforeShutdown
    }).listen(config.port, () => {
      console.log(
        'Express server listening on %d, in %s mode',
        config.port,
        app.get('env')
      );
    });
  }

  return {
    startServer
  };
}
