const GetXMLNodeContent=(xelement, path, defval)=>{
    try{
        const splitpath=path.split("/@")
        path=splitpath[0]
        const node=GetXMLNodes(xelement,path)[0]
        if (splitpath.length==2) return GetAttribute(node,splitpath[1],defval)
        return GetContent(node,defval)
    }catch{}
    return defval
}
const GetAttribute=(xelement,label,defval)=>{
    try{
        
        let result= xelement.getAttributeNode(label).value
        if (result){
            const resnum=result.replace(/,/g,".")
            if (!isNaN(Number(resnum))) return resnum
            return result.replace(/"/g,"/")
        }
            
    }catch(e){
       console.log(e)
    }
     return defval
}
const GetXMLNodes=(xml, path)=>{
    let result=[xml]
    try{
        if (path.length==0) return result 
        
        let items=[]
        //if (path.includes('/')) items.concat(path.split("/"))
      items.push(...path.split("/"))   
        for (const item of items) {                     
            for (const itm of result) {    
                const children=[]
                const itms=itm.childNodes
                for (var i = 0; i < itms.length; i++) {
                    if (itms[i]['nodeName']==item) children.push(itms[i])
                }
                result=[...children]
            }
        }
        return result
    }catch
    {
       
    }
    return undefined
} 
const GetContent=(xelement, defval)=>{
    try{
        
        let result= xelement.textContent
        if (result){
            const resnum=result.replace(/,/g,".")
            if (!isNaN(Number(resnum))) return resnum
            return result.replace(/"/g,"/")
        }
            
    }catch(e){
       //console.log(e)
    }
     return defval
}


module.exports = {GetXMLNodeContent, GetXMLNodes};