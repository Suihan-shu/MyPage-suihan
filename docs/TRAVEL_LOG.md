# 旅行日志使用说明

旅行日志使用前端密码校验，适合在 GitHub Pages 上提供轻量的访问门槛。密码和旅行数据都会写入生成后的网页源码，熟悉开发者工具的访问者仍可绕过校验，因此不要存放身份证、住址、实时行程等敏感信息，也不要复用重要账户的密码。

## 设置密码

编辑 `_data/travel.yml`：

```yaml
password: "在这里填写访问密码"
entries: []
```

## 添加旅行记录

先把照片放到 `assets/img/travel/`，再向 `entries` 添加一项：

```yaml
entries:
  - id: trip-2026-01
    date: 2026-01-20
    time: "09:30"
    location: 杭州 · 西湖
    title: 安静的冬日清晨
    text: 在这里写几句话。
    photos:
      - file: /assets/img/travel/west-lake-01.jpg
        alt: 冬日西湖
        caption: 照片说明
```

除 `id` 外的字段都可以省略。`id` 必须唯一；日期建议使用 `YYYY-MM-DD`；一条记录可以添加多张照片。`location`、`title`、`text`、`alt` 和 `caption` 直接填写中文字符串即可。
