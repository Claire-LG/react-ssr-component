## API

| 参数|类型| 是否必传|说明|
|----------- |----------| ---------- |-------|
| App      |  < App />     | required     |     |
|getStore|redux store|required|  |  
|setWebp|webp action|required|  |  
|setFooterData|setFooterData action| | 默认空 |  
|setLanguage|lang action|required| |
|routes|routes|required| |
|locales|object|| 服务端locales |
|fetchList|array|required| 接口请求列表 |
|beforeLoad|function| | 请求接口前 |
|beforeRender|function| | 页面渲染前 |
|prefix|string 大小写均可|否| 默认VP | 
