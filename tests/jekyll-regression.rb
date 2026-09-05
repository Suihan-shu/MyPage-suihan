require 'jekyll'
require 'json'
require_relative '../_plugins/file-exists'
site = Jekyll::Site.new(Jekyll.configuration('source' => Dir.pwd, 'baseurl' => '/MyPage-suihan'))
context = Liquid::Context.new({}, {}, { site: site })
tag = Jekyll::FileExistsTag.allocate
tag.instance_variable_set(:@path, 'Gemfile')
raise 'file_exists fails without whitespace' unless tag.render(context) == 'true'
tag.instance_variable_set(:@path, ' definitely-missing.file ')
raise 'file_exists should return false' unless tag.render(context) == 'false'
puts 'PASS file_exists with clean and padded paths'
text = "A \"quoted\" title \\ 中文\nnext"
fixture_site = {
  'pages' => [
    { 'permalink' => '/', 'title' => text, 'nav_order' => 0 },
    { 'nav' => true, 'title' => text, 'description' => text, 'url' => '/cv/', 'nav_order' => 1 },
    { 'nav' => true, 'title' => 'Dropdown', 'dropdown' => true, 'nav_order' => 2,
      'children' => [{ 'title' => text, 'description' => text, 'permalink' => '/travel/' }] }
  ],
  'collections' => [{ 'label' => 'projects', 'docs' => [{ 'title' => text, 'description' => text, 'url' => '/projects/test/' }] }],
  'data' => { 'i18n' => { 'zh' => { 'search' => {} } },
    'socials' => { 'qq_qr' => { 'title' => text, 'url' => "#a'b\"c" }, 'github_username' => 'tester' } },
  'enable_darkmode' => true
}
source = File.read('_scripts/search.liquid.js').sub(/\A---.*?---\s*/m, '')
output = Liquid::Template.parse(source, error_mode: :strict).render!({ 'site' => fixture_site }, registers: { site: site })
File.write('_site/review-search-fixture.js', output)
puts 'PASS strict Liquid search template render; fixture ready for JavaScript validation'
