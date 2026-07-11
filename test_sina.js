fetch('https://zhibo.sina.com.cn/api/zhibo/feed?page=1&page_size=50&zhibo_id=152')
    .then(r => r.json())
    .then(data => console.log(data))
    .catch(e => console.error(e));
