const fs = require('fs')

// 请求模块，文档可参考：https://www.jianshu.com/p/1432e0f29abd
const superagent = require('superagent')

const main = () => {
    getAllDistrict();
}

// 获取全部数据
const getAllDistrict = async () => {
    let list = [];

    // 接口地址： https://lbs.qq.com/webservice_v1/guide-region.html
    // key值，需要注册腾讯地图账号(https://lbs.qq.com/index.html)获取

    const url = 'https://apis.map.qq.com/ws/district/v1/list?key=****';

    try{
        list = (await superagent.get(url)).body.result;
    } catch(err) {
        console.log(err)
    }

    getSheng(list);
}

// 获取省级数据
const getSheng = list => {
    let data = [];

    list[0].forEach(v => {
        let shengItem = {
            value: v.id,
            label: v.fullname,
            children: []
        }

        data.push(getShi(list, shengItem));
    });

    output(data);
}

// 获取市级数据
const getShi = (list, shengItem) => {

    list[1].forEach(v => {
        let shengSign = shengItem.value.slice(0, 2);
        let shiSign = v.id.slice(0, 2);

        if(shengSign === shiSign){
            let shiItem = {
                value: v.id,
                label: v.fullname,
                children: []
            }

            shengItem.children.push(getQu(list, shiItem));
        }
    });

    return shengItem;
}

// 获取区级数据
const getQu = (list, shiItem) => {

    list[2].forEach(v => {
        let shiSign = shiItem.value.slice(0, 4);
        let qusign = v.id.slice(0, 4);

        if(shiSign === qusign){

            shiItem.children.push({
                value: v.id,
                label: v.fullname
            });
        }
    });

    // 若市级下没有区，删除 children
    if(!shiItem.children.length){
        delete shiItem.children;
    }

    return shiItem;
}

// 输出
const output = data => {
    let dataStr = JSON.stringify(data);

    fs.writeFileSync(
        'data.json',
        dataStr,
        function(err){
            if(err){
                console.log('输出失败')
            }
        })
}

main();
