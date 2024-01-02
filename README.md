# flownarios

test a variety of flow packaging scenarios with different flow types

```mermaid
```

## Generating flows

Copy flow scenarios (flownarios) into `scripts/data.csv` without headers. The file expects four columns:

1. Package v1 type and status
2. Customer Changes
3. Package v2 (ISV Changes)
4. Hash

Run `npm run createFlows` to generate flow metadata files out of CSV inputs. Flows will be created with a seven character substring of Hash serving as the name. This is done to ensure consistent naming across versions.
