# Grafana Cloud Logs for Iced Latte Frontend

The frontend does not need special log shipping code for the Grafana Cloud path added in the backend repository.

## Why

The frontend Docker image runs the Next.js standalone server and writes logs to container stdout.
That means Promtail can collect those logs from Docker directly without changing the frontend runtime code.

## How this frontend maps to the backend observability PR

Use the backend repository overlays for Docker container log shipping:
- `docker-compose.cloud-logs.containers.yml`
- `promtail/config.cloud.containers.yml`
- `.env.observability.example`

When the frontend container is started through Docker Compose, Promtail can discover it through the Docker socket and push its stdout logs to Grafana Cloud Loki.

## Expected labels

The backend-side collector config adds Docker metadata labels, so in Grafana Cloud you can query logs like this:

```logql
{compose_service="frontend"}
```

If you want only one frontend container:

```logql
{container="iced-latte-frontend"}
```

## Why this PR is documentation-only

For this Grafana Cloud approach, the required work is infrastructure-side, not frontend-code-side.
The frontend already produces logs in the way Promtail needs for container scraping.
