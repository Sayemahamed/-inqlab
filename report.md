problem a:- Move code directory into packages/code =>
solution a:- Relocate the existing code directory into packages/code to establish the monorepo directory layout defined in the publishing guide.

problem b:- Root workspace manifests and git initialization =>
solution b:- Initialize the git repository, set up gitignore for node modules and build artifacts, create private root package manifest, and add root TypeScript configuration.

problem c:- npm authentication check before publishing =>
solution c:- Verify active npm user authentication in the shell environment before executing npm publish with public access for the inqlab scope.
