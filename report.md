problem a:- New Intelli CLI currently resides in temporary root cli directory => ok
solution a:- Relocate and structure under packages/intelli as an independent monorepo package with manifest naming @inqlab/intelli, homepage https://intelli.inqlab.dev, and dual binary entries intelli and inqlab-intelli.

problem b:- Manual argument parsing in both CLI packages needs modern command framework => ok
solution b:- Adopt citty across both @inqlab/intelli and @inqlab/code to provide declarative subcommands, type-safe arguments, and clean automatic usage rendering.

problem c:- Disparate home configuration directory paths across CLIs => ok
solution c:- Unify configuration storage for both tools inside a shared dot inqlab directory in the user home directory, saving code.json for the code CLI and intelli.json for the intelli CLI.

problem d:- Preserving Model Context Protocol stdio communication integrity under citty => ok
solution d:- Ensure citty help or banner output routes to standard error when mcp flag is provided to prevent corrupting JSON-RPC communication on standard output.
