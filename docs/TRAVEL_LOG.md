# Travel journal

The Travel Journal is a lightweight front-end password gate. It keeps the
existing site simple and works on GitHub Pages, but it is not server-side
access control: a visitor who inspects the generated source can bypass the
password and read the travel data.

## Set the password

Edit `_data/travel.yml`:

```yaml
password: "replace-this-with-your-password"
entries: []
```

The password is embedded in the generated page and compared in the browser.
Do not reuse an important account password.

## Add an entry

Put travel photos in `assets/img/travel/`, then add an item to `entries`:

```yaml
entries:
  - id: trip-2026-01
    date: 2026-01-20
    time: "09:30"
    location:
      en: Hangzhou · West Lake
      zh: 杭州 · 西湖
    title:
      en: A quiet winter morning
      zh: 安静的冬日清晨
    text:
      en: Write a few sentences here.
      zh: 在这里写几句话。
    photos:
      - file: /assets/img/travel/west-lake-01.jpg
        alt:
          en: West Lake in winter
          zh: 冬日西湖
        caption:
          en: A short caption
          zh: 照片说明
```

All fields except `id` are optional. `location`, `title`, `text`, `alt`, and
`caption` may be a plain string or an object with `en` and `zh` values.
