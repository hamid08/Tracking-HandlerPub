import config from './config/config'


//"serve": " \"nodemon -r ./dist/instrumentation.js dist/app.js\"",
// "serve": " \"node -r ./dist/instrumentation.js dist/app.js\"",
// "start": "pm2 start ./dist/instrumentation.js dist/app.js  --no-daemon"


import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const exporterOptions = {
   url: `${config.otlp.uri}/v1/traces`
}

const traceExporter = new OTLPTraceExporter(exporterOptions);
const sdk = new NodeSDK({
   traceExporter: new OTLPTraceExporter({
      // optional - default url is http://localhost:4318/v1/traces
      url: `${config.otlp.uri}/v1/traces`,
      // optional - collection of custom headers to be sent with each request, empty by default
      headers: {},
   }),
   metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
         url: `${config.otlp.uri}/v1/metrics`, // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
         headers: {}, // an optional object containing custom headers to be sent with each request
         concurrencyLimit: 1, // an optional limit on pending requests
      }),
   }),
   instrumentations: [getNodeAutoInstrumentations()],
   resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'tracking-data-handler'
   })
});

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry

sdk.start()

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
   sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
});
