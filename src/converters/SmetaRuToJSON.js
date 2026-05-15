const {GetXMLNodeContent, GetXMLNodes} = require('../utils/UtilsTbls');
const {region_enum} = require('./Dictionary');
const SmetaRuToJSON =  (xml, filename=undefined)=>{
    let result = {smeta:{},vr:[],index:[]}
    const root=xml.getElementsByTagName("Document")[0]
    const smetaid= GetXMLNodeContent(root,"Object/ObjStructElems/ObjStructElemLS/@ID")
/* let inactive=false //Переменная для фильтрации исключённых из расчёта позиций
   result.vr=GetXMLNodes(root,"VidRab_Catalog/Vids_Rab").flatMap(item=>(
        GetXMLNodes(item,"VidRab_Group").flatMap(item=>(GetXMLNodes(item,"Vid_Rab").map(itm=>({
                Grop_Caption:GetXMLNodeContent(item,"/@Caption"),
                Group_ID:GetXMLNodeContent(item,"/@ID"),
                Caption:GetXMLNodeContent(itm,"/@Caption"),
                SourceID:GetXMLNodeContent(itm,"/@ID"),
                OsColumn:GetXMLNodeContent(itm,"/@OsColumn"),
                Category:GetXMLNodeContent(itm,"/@Category"),
                ResGroup:GetXMLNodeContent(itm,"/@ResGroup"),
                NrCode:GetXMLNodeContent(itm,"/@NrCode"),
                SpCode:GetXMLNodeContent(itm,"/@SpCode"),
                Nacl:GetXMLNodeContent(itm,"/@Nacl"),
                Plan:GetXMLNodeContent(itm,"/@Plan"),
                NaclCurr:GetXMLNodeContent(itm,"/@NaclCurr"),
                PlanCurr:GetXMLNodeContent(itm,"/@PlanCurr"),
                NaclMask:GetXMLNodeContent(itm,"/@NaclMask"),
                PlanMask:GetXMLNodeContent(itm,"/@PlanMask"),
                NrKfsCode:GetXMLNodeContent(itm,"/@NrKfsCode"),
                SpKfsCode:GetXMLNodeContent(itm,"/@SpKfsCode"),
                NKB:GetXMLNodeContent(itm,"/@NKB"),
                NKI:GetXMLNodeContent(itm,"/@NKI"),
                NKR:GetXMLNodeContent(itm,"/@NKR"),
                PKI:GetXMLNodeContent(itm,"/@PKI"),
                PKR:GetXMLNodeContent(itm,"/@PKR"),
                PNB:GetXMLNodeContent(itm,"/@PNB"),
        }))))
        
        ) 
        )
   result.index=[
        ...GetXMLNodes(root,"Indexes/IndexesPos/Index").map(ind=>(        
        {
                Type:'Pos',
                Caption:GetXMLNodeContent(ind,"/@Caption"),
                Code:GetXMLNodeContent(ind,"/@Code"),
                OZ:GetXMLNodeContent(ind,"/@OZ"),
                EM:GetXMLNodeContent(ind,"/@EM"),
                ZM:GetXMLNodeContent(ind,"/@ZM"),
                MT:GetXMLNodeContent(ind,"/@MT"),
                ...Object.assign({},...GetXMLNodes(ind,"IndexesAddOns/AddOn")
                .map(addon=>((type=>
                        type==='NR'?
                        {
                                NROZ:GetXMLNodeContent(addon,"/@OZ"),
                                NRZM:GetXMLNodeContent(addon,"/@ZM")
                        }
                        :type==='SP'?
                        {
                                SPOZ:GetXMLNodeContent(addon,"/@OZ"),
                                SPZM:GetXMLNodeContent(addon,"/@ZM")
                        }
                        :type==='ZU'?
                        {
                                ZUOZ:GetXMLNodeContent(addon,"/@OZ"),
                                ZUEM:GetXMLNodeContent(addon,"/@EM"),
                                ZUZM:GetXMLNodeContent(addon,"/@ZM"),
                                ZUMT:GetXMLNodeContent(addon,"/@MT")
                        }
                        :undefined)(GetXMLNodeContent(addon,'/@Type'))))) 
        })),
        ...GetXMLNodes(root,"Indexes/IndexesRes/Index").map(ind=>(        
        {
                Type:'Res',
                Caption:GetXMLNodeContent(ind,"/@Caption"),
                Code:GetXMLNodeContent(ind,"/@Code"),
                OZ:GetXMLNodeContent(ind,"/@OZ"),
                EM:GetXMLNodeContent(ind,"/@EM"),
                ZM:GetXMLNodeContent(ind,"/@ZM"),
                MT:GetXMLNodeContent(ind,"/@MT"),
                SMR:GetXMLNodeContent(ind,"/@SMR")
        })),
]
const SmetaKoeffs=GetXMLNodes(root,'Koefficients/K')*/
   result.smeta={
        FileName:filename,
        Generator:GetXMLNodeContent(root,"/@Generator"),
        ProgramVersion:GetXMLNodeContent(root,"/@Version"),
        LocNum:GetXMLNodeContent(root,"Object/ObjStructElems/ObjStructElemLS/@SHIFR"),
        Constr:GetXMLNodeContent(root,"Object/Obj_Params/Obj_Names/NAME_STROYKI"),
        Object:GetXMLNodeContent(root,"Object/@FullName"),
        Options: 'NoFormuls',
        Description:GetXMLNodeContent(root,"Object/ObjStructElems/ObjStructElemLS/@FULLNAME"),
        AddOnNumber:(str=>{
                if (!str) return null
                const match = str.match(/Доп\s*(\d+)/i);
                return match ? match[1] : null;
        })(GetXMLNodeContent(root,"Object/Obj_Params/TR/Name")),

        SmetaTotal:((smeta)=>{
              if (!smeta) return null
              let result=null
              const itog=GetXMLNodes(smeta,"Itogs/StandartItog").find(item=>(GetXMLNodeContent(item,"/@AVAR")==="Всего"))
              if (!itog) return null
              GetXMLNodes(itog,"CostLevel_Itog").forEach(item=>(result=GetXMLNodeContent(item,"ITOG")))
              return result
        })(GetXMLNodes(root,"Object/StructElems/StructElemLS")[0]),
        chapter:((objchapters,chapters)=>{
              if (objchapters){
                 return objchapters.map((objchapter,ind)=>({
                        Caption:GetXMLNodeContent(objchapter,"/@FULLNAME"),
                        ChapterTotal:((chapter)=>{
                           let result=null
                           const itog=GetXMLNodes(chapter,"Itogs/StandartItog").find(item=>(GetXMLNodeContent(item,"/@AVAR")==="Всего"))
                           if (!itog) return null
                           GetXMLNodes(itog,"CostLevel_Itog").forEach(item=>(result=GetXMLNodeContent(item,"ITOG")))
                           return result     
                        })(chapters[ind]),
                        position:((positions)=>{
                                if (positions) return positions.map(position=>({
                                        Caption:GetXMLNodeContent(position,"/@NAME"),
                                        Number:`${GetXMLNodeContent(position,"Obj_Position_Params/VIEW_NUMBER1")}${(number2=>(number2!=='0'?
                                                `,${number2}${(number3=>(number3!=='0'?`,${number3}`:''))(GetXMLNodeContent(position,"Obj_Position_Params/VIEW_NUMBER3"))}`
                                                :''
                                        ))(GetXMLNodeContent(position,"Obj_Position_Params/VIEW_NUMBER2"))}`,
                                        Code:GetXMLNodeContent(position,"/@TAB"),
                                        Units:GetXMLNodeContent(position,"/@EDIZM_NAME"),
                                        SlaveRow:GetXMLNodeContent(position,"/@ATYPE")==='18'?"Yes":undefined,
                                        Quantity:GetXMLNodeContent(position,"/@KOLL"), 
                                        TotalWithNP:((CostLevel_Pos=>{
                                                let result
                                                CostLevel_Pos.sort((a, b) => {
                                                                const nA = Number(GetXMLNodeContent(a,"/@LYEAR"))
                                                                const nB = Number(GetXMLNodeContent(b,"/@LYEAR"))
                                                                if (isNaN(nA)) return -1;
                                                                if (isNaN(nB)) return 1;
                                                                return nA - nB
                                                            }).forEach(itog=>(result=GetXMLNodeContent(itog,"ITOGO")))
                                                return result
                                        }))(GetXMLNodes(position,"PositionCosts/CostLevel_Pos")),
                                }
                        )
                        )
                        })(GetXMLNodes(chapters[ind],"Positions/Position"))
                        }))
                        
                }else return []

                })                
                (
                        GetXMLNodes(GetXMLNodes(root,"Object/ObjStructElems/ObjStructElemLS")
                        .find(item=>(GetXMLNodeContent(item,"/@ID")===smetaid)),"ObjStructElemR"),
                        GetXMLNodes(GetXMLNodes(root,"Object/StructElems/StructElemLS")
                        .find(item=>(GetXMLNodeContent(item,"/@ID")===smetaid)),"StructElemR")
                )

                ,  

    
    } 

return result
}

module.exports = SmetaRuToJSON;