# 测试用观影记录仅注入内存，真实 _data/movies.json 不修改。
require 'jekyll'
require 'json'
require 'nokogiri'

fixture = JSON.parse(File.read('_site/review-artifacts/movie-saved-fixture.json'))
movie = fixture['movies'].first
movie['source']['title'] = '源片名'
movie['source']['countries'] = ['应被清除的国家']
movie['source']['genres'] = ['应被清除的类型']
movie['source']['overview'] = '应被清除的简介'
movie['source']['year'] = 2000
movie['overrides'].merge!('countries' => [], 'genres' => [], 'overview' => '', 'year' => nil)
movie['personal']['review'] = '<script id="movie-injected">alert(1)</script> 本地保存的短评'
Jekyll::Hooks.register :site, :post_read do |site|
  site.data['movies'] = fixture
end
site = Jekyll::Site.new(Jekyll.configuration('source' => Dir.pwd, 'destination' => '_site/movie-fixtures', 'baseurl' => '/MyPage-suihan'))
site.process
html = Nokogiri::HTML(File.read('_site/movie-fixtures/movies/index.html'))
card = html.at_css('.movie-card')
raise '静态模板未渲染记录' unless card
raise '人工片名未保留' unless card.at_css('h2').text.include?('修订片名')
raise '零分错误' unless card.text.include?('我的评分 0 / 10')
raise '日期未保留' unless card.text.include?('2026-09-30')
raise '人工清空字段被源资料覆盖' if card.text.include?('应被清除') || card.at_css('h2').text.include?('2000')
raise '短评注入 HTML' if card.at_css('#movie-injected')
raise '短评未按文本保留' unless card.text.include?('<script id="movie-injected">')
raise '源 ID 未保留' unless card.at_css('a.movie-source')['href'].end_with?('/202')
public_data = JSON.parse(File.read('_site/movie-fixtures/assets/movies.json'))
raise '公开 JSON 记录错误' unless public_data['movies'].first['personal']['rating'] == 0
raise '本地工具被发布' if File.exist?('_site/movie-fixtures/tools')
puts 'PASS 管理保存数据到 Jekyll 静态卡片：ID、修订优先级、清空字段、日期零分、HTML 转义与发布隔离'
