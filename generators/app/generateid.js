module.exports = function(){
    return 'xyzzyyyz-zzyy-xxyz-yzyz-xyxyzyzyyxyz'.replace(/[xyz]/g,(e,v)=>{
        return Math.round(Math.random()*15).toString('16');
    })
}