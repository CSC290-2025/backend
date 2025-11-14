import { BaseError } from '@/errors';

export class CleanAirProviderError extends BaseError {
  readonly name = 'CleanAirProviderError';
  readonly statusCode = 502;
  readonly isOperational = true;

  constructor(
    message = 'Failed to fetch air quality data',
    public readonly provider?: 'air4thai' | 'open-meteo'
  ) {
    super(message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      provider: this.provider,
    };
  }
}

export class CleanAirConfigurationError extends BaseError {
  readonly name = 'CleanAirConfigurationError';
  readonly statusCode = 500;
  readonly isOperational = true;

  constructor(message = 'Clean Air service misconfiguration') {
    super(message);
  }
}
