module.exports = function validateGuid(val){
    return /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-f]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(val) ? true : 'Please provide a valid guid e.g. xyzzyyyz-zzyy-xxyz-yzyz-xyxyzyzyyxyz';
}