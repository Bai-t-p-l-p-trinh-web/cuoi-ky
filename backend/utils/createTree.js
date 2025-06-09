const createTree = (arr , counter = {value : 0}, parentId ="") => {
    const tree = [];

    arr.forEach((item) => {
        
        if(item.parent_id === parentId){
            counter.value ++;
            const spreadItem = JSON.parse(JSON.stringify(item));
            const {_id, parent_id, __v, ...newItem} = spreadItem;
            newItem.index = counter.value;
            
            const children = createTree(arr, counter, item.id);
            
            if(children.length > 0){
                newItem.children = children;
            }
            tree.push(newItem);
        }
    });

    return tree;
}
module.exports.tree = (arr) => {
    const counter = { value : 0};
    const tree = createTree(arr, counter, "");
    return tree;
}