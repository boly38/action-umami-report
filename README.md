# action-umami-report

This action prints daily umami report into a given file

## Inputs

## `umami-server`

**Required** The umami server instance. Example `"umami.mysite.com"`.

## `umami-user`

**Required** The umami server instance user. Default `"admin"`.

## `umami-password`

**Required** The umami server instance password.

## `umami-site-domain`

**Required** The umami site domain name.  Example `"www.mysite.com"`.Default selecting the first site domain name.

## Outputs

## `umamiReport.md`

The umami report for last 24h.

## Example usage

```yaml
- name: Create Umami report
  uses: boly38/action-umami-report@v1
  with:
    umami-server: ${{secrets.UMAMI_SERVER}}
    umami-user: ${{secrets.UMAMI_USERNAME}}
    umami-password: ${{secrets.UMAMI_PASSWORD}}
    umami-site-domain: ${{secrets.UMAMI_SIDE_DOMAIN}}   
```

Full working sample: cf. [umamiReport.yml](.github/workflows/umamiReport.yml)

# See also

## Umami
- Umami [API](https://umami.is/docs/api) - [Source](https://github.com/umami-software/umami)

## possible next step
- send the report [by email](https://github.com/dawidd6/action-send-mail), on [discord](https://github.com/marketplace/actions/upload-to-discord), etc..