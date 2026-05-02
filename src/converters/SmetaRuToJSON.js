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
                                        SlaveRow:GetXMLNodeContent(position,"/@ATYPE")==='18'?"Yes":'',
                                        Quantity:GetXMLNodeContent(position,"/@KOLL"), 
                                        TotalWithNP:((CostLevel_Pos=>{
                                                let result
                                                CostLevel_Pos.forEach(itog=>(result=GetXMLNodeContent(itog,"ITOGO")))
                                                return result
                                        }))(GetXMLNodes(position,"PositionCosts/CostLevel_Pos")),
                                }
                        )
                        )
                        })(GetXMLNodes(chapters[ind],"Positions/Position"))
                        }))
                        
                }else return []

       /*                  position:((positions)=>{                                
                                if (positions) return positions.map(position=>({
                                        Caption:position.nodeName==='Position'?GetXMLNodeContent(position,"/@Caption"):undefined,
                                        Header:position.nodeName==='Header'?GetXMLNodeContent(position,"/@Caption"):undefined,
                                        Comment:position.nodeName==='Comment'?GetXMLNodeContent(position,"/@Caption"):undefined,
                                        Number:GetXMLNodeContent(position,"/@Number"),
                                        Code:GetXMLNodeContent(position,"/@Code"),
                                        Units:GetXMLNodeContent(position,"/@Units"),
                                        UserComment1:GetXMLNodeContent(position,"/@UserComment1"),
                                        UserComment2:GetXMLNodeContent(position,"/@UserComment2"),
                                        PriceLevel:GetXMLNodeContent(position,"/@PriceLevel"),
                                        DBComment:GetXMLNodeContent(position,"/@DBComment"),
                                        Options:GetXMLNodeContent(position,"/@Options"),
                                        SlaveRow:GetXMLNodeContent(position,"/@SlaveRow"),
                                        AuxMatCode:GetXMLNodeContent(position,"/@AuxMatCode"),
                                        AuxMat:GetXMLNodeContent(position,"/@AuxMat"),
                                        NKB:GetXMLNodeContent(position,"/@NKB"),
                                        NKI:GetXMLNodeContent(position,"/@NKI"),
                                        NKR:GetXMLNodeContent(position,"/@NKR"),
                                        PKI:GetXMLNodeContent(position,"/@PKI"),
                                        PKR:GetXMLNodeContent(position,"/@PKR"),
                                        PNB:GetXMLNodeContent(position,"/@PNB"),
                                        Nacl:GetXMLNodeContent(position,"CustomNPBase/@Nacl"),
                                        NaclMask:GetXMLNodeContent(position,"CustomNPBase/@NaclMask"),
                                        Plan:GetXMLNodeContent(position,"CustomNPBase/@Plan"),
                                        PlanMask:GetXMLNodeContent(position,"CustomNPBase/@PlanMask"),
                                        NaclCurr:GetXMLNodeContent(position,"CustomNPCurr/@Nacl"),
                                        NaclMaskCurr:GetXMLNodeContent(position,"CustomNPCurr/@NaclMask"),
                                        PlanCurr:GetXMLNodeContent(position,"CustomNPCurr/@Plan"),
                                        PlanMaskCurr:GetXMLNodeContent(position,"CustomNPCurr/@PlanMask"),
                                        TotalWithNP:(itog=>GetXMLNodeContent(itog,"/@TotalCurr"))(GetXMLNodes(position,"Itog/ItogRes/Itog/Itog")?.find(item=>((GetXMLNodeContent(item,"/@DataType")==='TotalWithNP')))),
                                        Mass:GetXMLNodeContent(position,"/@Mass"),
                                        vr:(Vr2001=>{
                                                const vr=result.vr.findIndex(item=>(item.SourceID==Vr2001))
                                                return (vr >-1)? vr + 1 :undefined             
                                        })(GetXMLNodeContent(position,"/@Vr2001")),
                                        index:(IndexCode=>{
                                                const index=result.index.findIndex(item=>((item.Code===IndexCode)&&(item.Type==='Pos')))
                                                return (index >-1)?index+1:undefined                     
                                        })(GetXMLNodeContent(position,"/@IndexCode")),
                                        ...(Quantity=>(!isNaN(Number(Quantity)))?
                                        {Quantity:Quantity}:(QuantityNode=>({
                                                Quantity:GetXMLNodeContent(QuantityNode,"/@Result"), 
                                                Precision:GetXMLNodeContent(QuantityNode,"/@Precision") 
                                        }))(GetXMLNodes(position,"Quantity")[0])
                                        )(GetXMLNodeContent(position,"/@Quantity")),
                                        ...(Price=>({
                                                BOZ:GetXMLNodeContent(Price,"/@OZ"),
                                                BEM:GetXMLNodeContent(Price,"/@EM"),
                                                BZM:GetXMLNodeContent(Price,"/@ZM"),
                                                BMT:GetXMLNodeContent(Price,"/@MT"),
                                                BPZ:GetXMLNodeContent(Price,"/@PZ")
                                        }))(GetXMLNodes(position,'PriceBase')[0]),
                                        ...(Price=>({
                                                COZ:GetXMLNodeContent(Price,"/@OZ"),
                                                CEM: GetXMLNodeContent(position,"Tzm2022/@Quantity")?null:GetXMLNodeContent(Price,"/@EM"),
                                                CZM:GetXMLNodeContent(Price,"/@ZM"),
                                                CMT:GetXMLNodeContent(Price,"/@MT")
                                        }))(GetXMLNodes(position,'PriceCurr')[0]),
                                        koeff:[...GetXMLNodes(position,'Koefficients/K')
                                                .filter(item=>(!GetXMLNodeContent(item,"/@Options").includes("Disabled"))),
                                        ...SmetaKoeffs
                                        .filter((item,ind) =>{
                         if ((GetXMLNodeContent(item,"/@Options"))&&(!GetXMLNodeContent(item,"/@Options").includes("Disabled")))
                         {
                            const ExcludedKfs=GetXMLNodeContent(position,"ExcludedKfs/@Value")
                            if (ExcludedKfs){
                                const re = new RegExp(`(?<=[\\,\\(,\\s,;])${ind}`, 'gi');
                                if (ExcludedKfs.match(re)) return false
                            }
                            const chapterl=GetXMLNodeContent(item,"/@ChaptersLinks",'').replace("(","").replace(")","").split(",")
                            if ((GetXMLNodeContent(item,"/@AllChapters")!=="No")||((chapterl.findIndex(item=>(item.trim()==GetXMLNodeContent(chapter,"/@SysID")))>-1))) {
                            if (GetXMLNodeContent(item,"/@AllVidRabs")=="No") {
                               const curvr=result.vr.find(item=>item.SourceID===GetXMLNodeContent(position,"/@Vr2001"))
                               if (curvr){
                                    const vrsl=GetXMLNodeContent(item,"/@VrsLinks",'')
                                    if  (vrsl.includes(curvr.SourceID)) return true
                                    const groups =GetXMLNodeContent(item,"/@VrGroupsLinks",'').replace("(","").replace(")","").split(",")
                                    if (groups.findIndex(item=>(item.trim()==curvr.Group_ID))>-1) return true 
                               }
                               return false
                            }
                            else return true
                        }
                         else return false   
                    }
                    else return false   
                }
                    )
                                        ].map(itm=>({
                                                Caption:GetXMLNodeContent(itm,"/@Caption"),
                                                Code:GetXMLNodeContent(itm,"/@Code"),
                                                Level:GetXMLNodeContent(itm,"/@Level"),
                                                Options:GetXMLNodeContent(itm,"/@Options"),
                                                Value_EM:GetXMLNodeContent(itm,"/@Value_EM"),
                                                Value_MT:GetXMLNodeContent(itm,"/@Value_MT"),
                                                Value_OZ:GetXMLNodeContent(itm,"/@Value_OZ"),
                                                Value_ZM:GetXMLNodeContent(itm,"/@Value_ZM"),
                                                Value_PZ:GetXMLNodeContent(itm,"/@Value_PZ")
                                        })),
                                        trans:[...GetXMLNodes(position, "Transportation/Item")].map((trans )=>({ 
                                                                Caption:GetXMLNodeContent(trans,'/@Caption'),
                                                                Code:GetXMLNodeContent(trans,'/@Code'),
                                                                PriceCurr:GetXMLNodeContent(trans,'/@PriceCurr'),
                                                                Units:GetXMLNodeContent(trans,'/@Units'),
                                                                KC:GetXMLNodeContent(trans,'/@KC')
                                                        })),
                                        resource:[
                                                ...GetXMLNodes(position, "Resources/Tzr"),
                                                ...GetXMLNodes(position, "Resources/Tzm"),
                                                ...GetXMLNodes(position, "Resources/Mch"),
                                                ...GetXMLNodes(position, "Resources/Mat"),
                                                GetXMLNodeContent(position,"Tzm2022/@Quantity")?position:null
                                        ].filter(item=>(item)).map(item=>(
                                                {
                                                        Type:item.nodeName==='Position'?'Mch':item.nodeName,
                                                        Caption:GetXMLNodeContent(item,"/@Caption"),
                                                        Code:GetXMLNodeContent(item,"/@Code"),
                                                        Units:GetXMLNodeContent(item,"/@Units"),
                                                        Quantity:item.nodeName==='Position'?'1':GetXMLNodeContent(item,"/@Quantity",GetXMLNodeContent(item,"/@FixedTotQty")),
                                                        WorkClass:GetXMLNodeContent(item,"/@WorkClass"),
                                                        Mass:GetXMLNodeContent(item,"/@Mass"),  
                                                        Category:GetXMLNodeContent(item,"/@Category"),    
                                                        ...(Price=>({
                                                                PriceBaseValue:GetXMLNodeContent(Price,"/@Value"),
                                                                PriceBaseZM:GetXMLNodeContent(Price,"/@ZM") 
                                                        }))(GetXMLNodes(item, "PriceBase")[0]),
                                                        ...(Price=>({
                                                                PriceCurrValue:GetXMLNodeContent(Price,"/@Value",GetXMLNodeContent(Price,"/@EM")),
                                                                PriceCurrZM:GetXMLNodeContent(Price,"/@ZM") 
                                                        }))(GetXMLNodes(item, "PriceCurr")[0]),
                                                        ...(Tzm2022=>({
                                                                TzmWorkClass:GetXMLNodeContent(Tzm2022,"/@WorkClass"),
                                                                TzmQuantity:GetXMLNodeContent(Tzm2022,"/@Quantity"),
                                                                TzmPrice:GetXMLNodeContent(Tzm2022,"/@Price"),
                                                                
                                                        }))(GetXMLNodes(item, "Tzm2022")[0]),
                                                        Options:GetXMLNodeContent(item,"/@Options"),
                                                        Attribs:GetXMLNodeContent(item,"/@Attribs"),
                                                        index:((IndexCode)=>{
                                                                const index=result.index.findIndex(item=>((item.Code===IndexCode)&&(item.Type==='Res')))
                                                                return (index>-1)? index+1:undefined
                                                        }
                                                        )(GetXMLNodeContent(item,"/@IndexCode")),
                                                        trans:[...GetXMLNodes(item, "Transportation/Item")].map((trans )=>({ 
                                                                Caption:GetXMLNodeContent(trans,'/@Caption'),
                                                                Code:GetXMLNodeContent(trans,'/@Code'),
                                                                PriceCurr:GetXMLNodeContent(trans,'/@PriceCurr'),
                                                                Units:GetXMLNodeContent(trans,'/@Units'),
                                                                KC:GetXMLNodeContent(trans,'/@KC')
                                                        })),

                                                })).filter(item=>(item.Attribs!=='Delete')),
                                       wl:[...GetXMLNodes(position, "WorksList/Work")].map((item )=>({ 
                                                Caption:GetXMLNodeContent(item,'/@Caption'),
                                        }))
                                })
                                                )                 
                                        }
                                )(GetXMLNodes(chapter,"Position,Header,Comment") //Комментарии заголовки отключены
                                .filter(item=>{
                 
                if (GetXMLNodeContent(item,"/@Options",'').includes("Inactive")==true){
                    if (GetXMLNodeContent(item,"/@SlaveRow",'').includes("Yes")==false) inactive=true

                    return false
                }
                if ((inactive==true)&& GetXMLNodeContent(item,"/@SlaveRow",'').includes("Yes")){
                    return false
                }else{
                    inactive=false
                }
                return true
                
            }))*/ 
                })                
                (
                        GetXMLNodes(GetXMLNodes(root,"Object/ObjStructElems/ObjStructElemLS")
                        .find(item=>(GetXMLNodeContent(item,"/@ID")===smetaid)),"ObjStructElemR"),
                        GetXMLNodes(GetXMLNodes(root,"Object/StructElems/StructElemLS")
                        .find(item=>(GetXMLNodeContent(item,"/@ID")===smetaid)),"StructElemR")
                )

                ,  
        /*lz: GetXMLNodes(root,'AddZatrats/AddZatrGlava').map(itm=>(
                GetXMLNodes(itm,'AddZatr').map(lz=>({
                        Glava:GetXMLNodeContent(itm,"/@Glava"),
                        Caption:GetXMLNodeContent(lz,"/@Caption"),
                        Value:GetXMLNodeContent(lz,"/@Value"),
                        Level:GetXMLNodeContent(lz,"/@Level"),
                        Options:GetXMLNodeContent(lz,"/@Options"),
                        Formula:GetXMLNodeContent(lz,"/@Formula")
                }))
        )).flat().filter(item=>(!item.Options.includes('Inactive')))*/
    
    } 

return result
}

module.exports = SmetaRuToJSON;