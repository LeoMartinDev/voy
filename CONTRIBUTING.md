# Contributing to Voy

Thank you for considering contributing to Voy :)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

- Check the [Issues](https://github.com/leomartindev/voy/issues) to see if the bug has already been reported.
- If not, create a new issue using the **Bug Report** template.
- Include as much detail as possible: steps to reproduce, expected behavior, actual behavior, and environment details.

### Suggesting Enhancements

- Check the [Issues](https://github.com/leomartindev/voy/issues) to see if the feature has already been suggested.
- If not, create a new issue using the **Feature Request** template.

### Pull Requests

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes (`bun test`).
5. Make sure your code follows the project's style (`bun check`).
6. Issue that Pull Request!

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) (v1.1+)
- [Docker](https://docs.docker.com/get-docker/)

### Setup

1. Clone your fork: `git clone https://github.com/YOUR_USERNAME/voy.git`
2. Install dependencies: `bun install`
3. Create a `.env` file: `cp .env.example .env`
4. Start the app in dev mode using docker compose: `docker compose -f compose.yml -f compose.override.yml up`

### Project Structure

Voy follows **Clean Architecture**:

- `src/server/domain`: Core business logic (ports and value objects). No external dependencies.
- `src/server/application`: Use cases and services. Orchestrates domain logic.
- `src/server/infrastructure`: External implementations (adapters for SearXNG, Drizzle, etc.).

### Style Guide

We use [Biome](https://biomejs.dev/) for linting and formatting.

- Format your code: `bun check --write`
- Check for issues: `bun check`

## License

By contributing to Voy, you agree that your contributions will be licensed under its [MIT License](LICENSE.md).
