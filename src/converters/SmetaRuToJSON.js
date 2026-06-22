const {GetXMLNodeContent, GetXMLNodes} = require('../utils/UtilsTbls');
const {region_enum} = require('./Dictionary');
const SmetaRuToJSON =  (xml, filename=undefined)=>{
    let result = {smeta:{},vr:[],index:[]}
    //const root=xml.getElementsByTagName("Document")[0]
    const root=xml.documentElement;
    const smetaid= GetXMLNodeContent(root,"Object/ObjStructElems/ObjStructElemLS/@ID")
    let costlevels=(GetXMLNodes(root,"Object/Obj_Params/Obj_CostLevels/CostLevel"))
    .slice(0, 2)
    const hascompose=costlevels.filter(item=>(GetXMLNodes(item,"Composes")[0].childNodes.length>0))
    if (hascompose.length>0) costlevels=hascompose
    const costlevelid=GetXMLNodeContent(costlevels.sort((a, b) => {
        const nA = Number(GetXMLNodeContent(a,"/@LYEAR"))
        const nB = Number(GetXMLNodeContent(b,"/@LYEAR"))
        if (isNaN(nA)) return -1;
        if (isNaN(nB)) return 1;
        return nB - nA
        })[0],'/@ID')

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
              const itog=GetXMLNodes(smeta,"Itogs/StandartItog").find(item=>(GetXMLNodeContent(item,"/@AVAR")==="Всего"))
              if (!itog) return null
              return GetXMLNodeContent(GetXMLNodes(itog,"CostLevel_Itog").find(item=>(GetXMLNodeContent(item,"/@ID")===costlevelid)),"ITOG") 
        })(GetXMLNodes(root,"Object/StructElems/StructElemLS")[0]),
        chapter:((objchapters,chapters)=>{
              if (objchapters){
                 return objchapters.map((objchapter,ind)=>({
                        Caption:GetXMLNodeContent(objchapter,"/@FULLNAME"),
                        ChapterTotal:((chapter)=>{
                           const itog=GetXMLNodes(chapter,"Itogs/StandartItog").find(item=>(GetXMLNodeContent(item,"/@AVAR")==="Всего"))
                           if (!itog) return null
                           return GetXMLNodeContent(GetXMLNodes(itog,"CostLevel_Itog").find(item=>(GetXMLNodeContent(item,"/@ID")===costlevelid)),"ITOG")    
                        })(chapters[ind]),
                        position:[...((positions)=>{
                                if (positions) return positions.map(position=>({
                                        Caption:GetXMLNodeContent(position,"/@ATYPE")!=='19'?GetXMLNodeContent(position,"/@NAME"):undefined,
                                        Number:GetXMLNodeContent(position,"/@ATYPE")!=='19'?`${GetXMLNodeContent(position,"Obj_Position_Params/VIEW_NUMBER1")}${(number2=>(number2!=='0'?
                                                `,${number2}${(number3=>(number3!=='0'?`,${number3}`:''))(GetXMLNodeContent(position,"Obj_Position_Params/VIEW_NUMBER3"))}`
                                                :''
                                        ))(GetXMLNodeContent(position,"Obj_Position_Params/VIEW_NUMBER2"))}`:undefined,
                                        Code:GetXMLNodeContent(position,"/@TAB"),
                                        Units:GetXMLNodeContent(position,"/@EDIZM_NAME"),
                                        Comment:GetXMLNodeContent(position,"/@ATYPE")==='19'?GetXMLNodeContent(position,"/@NAME"):undefined,
                                        SlaveRow:GetXMLNodeContent(position,"/@ATYPE")==='18'?"Yes":undefined,
                                        Quantity:GetXMLNodeContent(position,"/@KOLL"), 
                                        TotalWithNP:GetXMLNodeContent(GetXMLNodes(position,"PositionCosts/CostLevel_Pos")
                                        .find(item=>(GetXMLNodeContent(item,"/@ID")===costlevelid)),"ITOGO")
                                }
                        )
                        )
                        })(GetXMLNodes(chapters[ind],"Positions/Position").filter(item=>(GetXMLNodeContent(item,"Obj_Position_Params/VIEW_NUMBER1")!=='-1'))),
                        ...((objpchapters,pchapters)=>{

                                return objpchapters.map((objpchapter,index)=>(
                                        [
                                                {
                                                        Header:GetXMLNodeContent(objpchapter,"/@FULLNAME")
                                                },
                                                ...pchapters[index]?
                                                GetXMLNodes(pchapters[index],"Positions/Position")
                                                .filter(item=>(GetXMLNodeContent(item,"Obj_Position_Params/VIEW_NUMBER1")!=='-1'))
                                                .map(position=>(
                                                        {
                                                                Caption:GetXMLNodeContent(position,"/@ATYPE")!=='19'?GetXMLNodeContent(position,"/@NAME"):undefined,
                                                                Number:GetXMLNodeContent(position,"/@ATYPE")!=='19'?`${GetXMLNodeContent(position,"Obj_Position_Params/VIEW_NUMBER1")}${(number2=>(number2!=='0'?
                                                                 `,${number2}${(number3=>(number3!=='0'?`,${number3}`:''))(GetXMLNodeContent(position,"Obj_Position_Params/VIEW_NUMBER3"))}`
                                                                        :''
                                                                ))(GetXMLNodeContent(position,"Obj_Position_Params/VIEW_NUMBER2"))}`:undefined,
                                                                Code:GetXMLNodeContent(position,"/@TAB"),
                                                                Units:GetXMLNodeContent(position,"/@EDIZM_NAME"),
                                                                Comment:GetXMLNodeContent(position,"/@ATYPE")==='19'?GetXMLNodeContent(position,"/@NAME"):undefined,
                                                                SlaveRow:GetXMLNodeContent(position,"/@ATYPE")==='18'?"Yes":undefined,
                                                                Quantity:GetXMLNodeContent(position,"/@KOLL"), 
                                                                TotalWithNP:GetXMLNodeContent(GetXMLNodes(position,"PositionCosts/CostLevel_Pos")
                                                                .find(item=>(GetXMLNodeContent(item,"/@ID")===costlevelid)),"ITOGO")
                                                        }
                                                )):[]

                                        ]
                                )
                                ).reduce((acc, val) => acc.concat(val), [])
                        })(GetXMLNodes(objchapter,"ObjStructElemPR")
                        ,chapters[ind]?GetXMLNodes(chapters[ind],"StructElemPR"):null)
                
                ]
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