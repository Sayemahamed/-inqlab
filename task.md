# Idiomatic Citty Architecture and CLI Modernization Plan

- [x] Command Architecture Decomposition for Code Package
  - [x] Create modular workspace citty command definition with list and create subcommands
  - [x] Create modular project citty command definition with list, create, and path subcommands
  - [x] Create modular branch citty command definition with list, create, and switch subcommands
  - [x] Create modular test and login citty command definitions
  - [x] Remove legacy monolithic dispatch wrappers from commands module
  - [x] Refactor main entrypoint in code package to compose modular citty definitions
- [x] Schema and Argument Enhancement for Intelli Package
  - [x] Add value hints and enum option validation to project creation command
  - [x] Add typed value hints to login, api-key, and configuration arguments
  - [x] Refactor command entrypoint to use citty subcommand registration
- [x] Verification and Quality Assurance
  - [x] Rebuild both packages using Bun
  - [x] Verify zero TypeScript errors under strict type checking
  - [x] Validate generated citty usage output and argument hints for both CLIs
