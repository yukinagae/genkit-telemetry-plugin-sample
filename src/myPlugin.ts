import { type LoggerConfig, type Plugin, type TelemetryConfig, genkitPlugin } from '@genkit-ai/core'
import type { Span } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import type { Instrumentation } from '@opentelemetry/instrumentation'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { Resource } from '@opentelemetry/resources'
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node'
import {
  AlwaysOnSampler,
  BatchSpanProcessor,
  InMemorySpanExporter,
} from '@opentelemetry/sdk-trace-base'

export interface MyPluginOptions {
  // [Optional] Your plugin options
  foo?: string
}

const myPluginInstrumentations: Instrumentation[] = getNodeAutoInstrumentations().concat([
  new WinstonInstrumentation({
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    logHook: (span: Span, record: any) => {
      record['my-trace-id'] = span.spanContext().traceId
      record['my-span-id'] = span.spanContext().spanId
      record['is-trace-sampled'] = span.spanContext().traceFlags
    },
  }),
])

const myTelemetryConfig: TelemetryConfig = {
  getConfig(): Partial<NodeSDKConfiguration> {
    return {
      resource: new Resource({}),
      spanProcessor: new BatchSpanProcessor(new InMemorySpanExporter()),
      sampler: new AlwaysOnSampler(),
      instrumentations: myPluginInstrumentations,
      metricReader: new PeriodicExportingMetricReader({
        exporter: new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE),
      }),
    }
  },
}

const myLogger: LoggerConfig = {
  async getLogger(env: string) {
    // Do not import winston before calling getLogger so that the NodeSDK
    // instrumentations can be registered first.
    const winston = await import('winston')

    return winston.createLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.printf((info): string => {
        return `[${info.level}] ${info.message}`
      }),
    })
  },
}

export const myPlugin: Plugin<[MyPluginOptions] | []> = genkitPlugin(
  'myPlugin',
  async (options?: MyPluginOptions) => {
    return {
      telemetry: {
        instrumentation: {
          id: 'myPlugin',
          value: myTelemetryConfig,
        },
        logger: {
          id: 'myPlugin',
          value: myLogger,
        },
      },
    }
  },
)

export default myPlugin
