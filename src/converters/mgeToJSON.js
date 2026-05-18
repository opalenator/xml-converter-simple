const {GetXMLNodeContent, GetXMLNodes} = require('../utils/UtilsTbls');
const {base_enum, region_enum} = require('../converters/Dictionary');

const mgeToJSON =  (xml, filename=undefined)=>{
    let result = {smeta:{},vr:[],index:[]}
    const root=xml.getElementsByTagName("Construction")[0]
   result.smeta={
        FileName:filename,
        Generator:GetXMLNodeContent(root,"Meta/Soft/Name"),
        ProgramVersion:GetXMLNodeContent(root,"Meta/Soft/Version"),
        LocNum:GetXMLNodeContent(root,"Object/Estimate/Num"),
        Object:GetXMLNodeContent(root,"Object/Name"),
        Options: 'NoFormuls',
        Description:GetXMLNodeContent(root,"Object/Estimate/Name"),
        AddOnNumber:GetXMLNodeContent(root,"Object/Estimate/Normative/AdditionNumber"),
        SmetaTotal:GetXMLNodeContent(root,"Object/Estimate/EstimatePrice/Total/PriceCurrent"),
        chapter:((chapters)=>{
            if (chapters) return chapters.map(chapter=>(
                {
                    Caption:GetXMLNodeContent(chapter,"Name"),
                    ChapterTotal:GetXMLNodeContent(chapter,"SectionPrice/Summary/Total/PriceCurrent"),
                    position:((positions)=>{
                        if (positions) return positions.map(position=>({
                            Caption:GetXMLNodeContent(position,"Cost/Name"),
                            Number:GetXMLNodeContent(position,"Cost/Num"),
                            Code:GetXMLNodeContent(position,"Cost/Code"),
                            Units:GetXMLNodeContent(position,"Cost/Unit"),
                            //SlaveRow:GetXMLNodeContent(position,"/@ATYPE")==='18'?"Yes":undefined,
                            Quantity:GetXMLNodeContent(position,"Cost/QuantityTotal"), 
                            TotalWithNP:GetXMLNodeContent(position,"Cost/Totals/Current/Total"), 
                        }))
                        else return []
                    })(GetXMLNodes(chapter,"Items/Item"))
                })
                    ) 
                    else return []

               })                
        (GetXMLNodes(root,"Object/Estimate/Sections/Section"))
                ,  

     
    } 

return result
}

module.exports = mgeToJSON;