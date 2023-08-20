# Model Scripts

Scripts related to manipulating model data should be placed here. Standalone scripts like these are hard to get coverage for and will be ignored from coverage charts, however, if tests are defined, Jest will run them.

## Run a script

```typescript
// From the project root
cd packages/server/frontend
yarn script ./src/model/scripts/createUser.ts
```

## Test a script

```typescript
// From the project root
// Note, no coverage will gathered even when using `--coverage` option.
yarn jest packages/server/frontend/src/model/scripts/__tests__/createUser.spec.ts
```
