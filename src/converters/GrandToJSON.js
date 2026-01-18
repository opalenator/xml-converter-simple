const {GetXMLNodeContent, GetXMLNodes} = require('../utils/UtilsTbls');
const {region_enum} = require('./Dictionary');
const GrandToJSON =  (xml, filename=undefined)=>{
    let result = {smeta:{},vr:[],index:[]}
    const root=xml.getElementsByTagName("Document")[0]
let inactive=false //Переменная для фильтрации исключённых из расчёта позиций
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
const SmetaKoeffs=GetXMLNodes(root,'Koefficients/K')
   result.smeta={
        FileName:filename,
        Generator:(GetXMLNodeContent(root,"/@Generator")=='GrandSmeta')?'ГРАНД-Смета':GetXMLNodeContent(root,"/@Generator"),
        ProgramVersion:(GetXMLNodeContent(root,"/@Generator")=='GrandSmeta')?(pv=>{
            const args =pv.split(".")
            if (args.length>1) return `'20${String(Number(args[0])+10)}.${args[1]}.${args[2]}`
            return pv
        })(GetXMLNodeContent(root,"/@ProgramVersion")):GetXMLNodeContent(root,"/@Generator"),
        LocNum:GetXMLNodeContent(root,"Properties/@LocNum"),
        Constr:GetXMLNodeContent(root,"Properties/@Constr"),
        Object:GetXMLNodeContent(root,"Properties/@Object"),
        Description:GetXMLNodeContent(root,"Properties/@Description"),
        RegionName:GetXMLNodeContent(root,"RegionInfo/@RegionName"),
        RegionID:GetXMLNodeContent(root,"RegionInfo/@RegionID"),
        Zone01Name:GetXMLNodeContent(root,"RegionInfo/@Zone01Name"),
        Zone01ID:GetXMLNodeContent(root,"RegionInfo/@Zone01ID"),
        AdmRegionZone:GetXMLNodeContent(root,"RegionInfo/@AdmRegionZone"),
        AdmRegionCode:GetXMLNodeContent(root,"RegionInfo/@AdmRegionCode"),
        Overhd_BaseName:GetXMLNodeContent(root,"FRSN_Info/Overhd_Info/@BaseName"),
        Overhd_RegNumber:GetXMLNodeContent(root,"FRSN_Info/Overhd_Info/@RegNumber"),
        Overhd_RegDate:GetXMLNodeContent(root,"FRSN_Info/Overhd_Info/@RegDate"),
        Overhd_OrderDetails:GetXMLNodeContent(root,"FRSN_Info/Overhd_Info/@OrderDetails"),
        Profit_BaseName:GetXMLNodeContent(root,"FRSN_Info/Profit_Info/@BaseName"),
        Profit_RegNumber:GetXMLNodeContent(root,"FRSN_Info/Profit_Info/@RegNumber"),
        Profit_RegDate:GetXMLNodeContent(root,"FRSN_Info/Profit_Info/@RegDate"),
        Profit_OrderDetails:GetXMLNodeContent(root,"FRSN_Info/Profit_Info/@OrderDetails"),
        ...(Vids_Rab=>({
                CatFile:GetXMLNodeContent(Vids_Rab,"/@CatFile"),
                NrspFile:GetXMLNodeContent(Vids_Rab,"/@NrspFile"),
                KfsFiles:GetXMLNodeContent(Vids_Rab,"/@KfsFiles")}))
                (GetXMLNodes(root,'VidRab_Catalog/Vids_Rab').filter((item) =>(GetXMLNodeContent(item,'/@Type')=='Виды работ 2001г'))[0]),
        ...(Indexes=>({...(GetXMLNodeContent(root,"OsInfo/@LinkType")==="RS")?{
                CommonIndexRCaption:GetXMLNodeContent(Indexes,"CommonIndexR/@Caption"),
                CommonIndexROptions:GetXMLNodeContent(Indexes,"CommonIndexR/@Options"),
                CommonIndexRFormula:GetXMLNodeContent(Indexes,"CommonIndexR/@Formula")
         }:{
                CommonIndexRCaption:GetXMLNodeContent(Indexes,"CommonIndexB20/@Caption"),
                CommonIndexROptions:GetXMLNodeContent(Indexes,"CommonIndexB20/@Options"),
                CommonIndexRFormula:GetXMLNodeContent(Indexes,"CommonIndexB20/@Formula")
         },
         IndexesMode:GetXMLNodeContent(Indexes,"/@IndexesMode"),
         IndexesLinkMode:GetXMLNodeContent(Indexes,"/@IndexesLinkMode")
        }
        ))(GetXMLNodes(root,'Indexes')[0]),
        ApprovalDate:GetXMLNodeContent(root,"DocDates/@ApprovalDate"),
        CreationDate:GetXMLNodeContent(root,"DocDates/@СreationDate"),
        ...Object.assign({},...GetXMLNodes(root,"GsDocSignatures/Item").map(itm=>
                (GetXMLNodeContent(itm,"/@Caption")==='Основание')?{['Reason']:GetXMLNodeContent(itm,"/@Value")}
                :(GetXMLNodeContent(itm,"/@Caption")==='Составил')?{['ComposeFIO']:GetXMLNodeContent(itm,"/@Value")}
                :(GetXMLNodeContent(itm,"/@Caption")==='Проверил')?{['VerifyFIO']:GetXMLNodeContent(itm,"/@Value")}
                :null)
        ),
        RegNumber:GetXMLNodeContent(root,"FRSN_Info/@RegNumber"),
        RegDate:GetXMLNodeContent(root,"FRSN_Info/@RegDate"),
        OrderDetails:GetXMLNodeContent(root,"FRSN_Info/@OrderDetails"),
        BaseName:GetXMLNodeContent(root,"FRSN_Info/@BaseName"),
        BaseType:GetXMLNodeContent(root,"FRSN_Info/@BaseType"),
        Index_Info_OrderDetails:GetXMLNodeContent(root,"FRSN_Info/Index_Info/@OrderDetails"),
        Wage_Info_OrderDetails:GetXMLNodeContent(root,"FRSN_Info/Wage_Info/@OrderDetails"),
        Index_Info_BaseType:GetXMLNodeContent(root,"FRSN_Info/Index_Info/@BaseType"),
        Wage_Info_BaseType:GetXMLNodeContent(root,"FRSN_Info/Wage_Info/@BaseType"),
        Overhd_BaseType:GetXMLNodeContent(root,"FRSN_Info/Overhd_Info/@BaseType"),
        Profit_BaseType:GetXMLNodeContent(root,"FRSN_Info/Profit_Info/@BaseType"),
        AdmRegionName:(region_name=>(region_name?region_name.Name:undefined))(region_enum.find(item=> (String(item.Code)=== GetXMLNodeContent(root,"RegionInfo/@AdmRegionCode")))),
        CurrPriceDate:GetXMLNodeContent(root,"DocDates/@CurrPriceDate"),
        BasePriceDate:GetXMLNodeContent(root,"DocDates/@BasePriceDate"),
        DocDatesOptions:GetXMLNodeContent(root,"DocDates/@Options"),
        Options:GetXMLNodeContent(root,"Parameters/@Options"),
        Mode2020Order:GetXMLNodeContent(root,"Parameters/@Mode2020Order"),
        BasePrices:GetXMLNodeContent(root,"Parameters/@BasePrices"),
        BaseCalcVrs:GetXMLNodeContent(root,"Parameters/@BaseCalcVrs"),
        TzDigits:GetXMLNodeContent(root,"Parameters/@TzDigits"),
        BlockRoundMode:GetXMLNodeContent(root,"Parameters/@BlockRoundMode"),
        MultKPosCalcMode:GetXMLNodeContent(root,"Parameters/@MultKPosCalcMode"),
        TempZone:GetXMLNodeContent(root,"Parameters/@TempZone"),
        TsnTempZone:GetXMLNodeContent(root,"Parameters/@TsnTempZone"),
        MatDigits:GetXMLNodeContent(root,"Parameters/@MatDigits"),
        MatRoundMode:GetXMLNodeContent(root,"Parameters/@MatRoundMode"),
        PosKDigits:GetXMLNodeContent(root,"Parameters/@PosKDigits"),
        ItogOptions:GetXMLNodeContent(root,"Parameters/@ItogOptions"),
        FirstItogItem:GetXMLNodeContent(root,"Parameters/@FirstItogItem"),
        ItogExpandTo:GetXMLNodeContent(root,"Parameters/@ItogExpandTo"),
        PropsConfigName:GetXMLNodeContent(root,"Parameters/@PropsConfigName"),
        PropsConfigNameModified:GetXMLNodeContent(root,"Parameters/@PropsConfigNameModified"),
        Numbering_Mode:GetXMLNodeContent(root,"Parameters/Numbering/@Mode"),
        Numbering_Options:GetXMLNodeContent(root,"Parameters/Numbering/@Options"),
        OSChapter:GetXMLNodeContent(root,"OsInfo/@OSChapter"),
        LinkType:GetXMLNodeContent(root,"OsInfo/@LinkType"),
        Industrial:GetXMLNodeContent(root,"OsInfo/@Industrial"),
        Cons:GetXMLNodeContent(root,"OsInfo/CCChapter/@Cons"),
        Rec:GetXMLNodeContent(root,"OsInfo/CCChapter/@Cons"),
        Road:GetXMLNodeContent(root,"OsInfo/CCChapter/@Cons"),
        MtsnZpmNB:GetXMLNodeContent(root,"Parameters/MtsnNPZpm/@NB"),
        MtsnZpmPB:GetXMLNodeContent(root,"Parameters/MtsnNPZpm/@PB"),
        MtsnZpmNC:GetXMLNodeContent(root,"Parameters/MtsnNPZpm/@NC"),
        MtsnZpmPC:GetXMLNodeContent(root,"Parameters/MtsnNPZpm/@PC"),
        chapter:((chapters)=>{
                if (chapters) return chapters.map(chapter=>({
                        Caption:GetXMLNodeContent(chapter,"/@Caption"),
                        position:((positions)=>{                                
                                if (positions) return positions.map(position=>({
                                        Caption:GetXMLNodeContent(position,"/@Caption"),
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
                                                CEM:GetXMLNodeContent(Price,"/@EM"),
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
                                        resource:[
                                                ...GetXMLNodes(position, "Resources/Tzr"),
                                                ...GetXMLNodes(position, "Resources/Tzm"),
                                                ...GetXMLNodes(position, "Resources/Mch"),
                                                ...GetXMLNodes(position, "Resources/Mat")
                                        ].map(item=>(
                                                {
                                                        Type:item.nodeName,
                                                        Caption:GetXMLNodeContent(item,"/@Caption"),
                                                        Code:GetXMLNodeContent(item,"/@Code"),
                                                        Units:GetXMLNodeContent(item,"/@Units"),
                                                        Quantity:GetXMLNodeContent(item,"/@Quantity"),
                                                        WorkClass:GetXMLNodeContent(item,"/@WorkClass"),
                                                        Mass:GetXMLNodeContent(item,"/@Mass"),    
                                                        ...(Price=>({
                                                                PriceBaseValue:GetXMLNodeContent(Price,"/@Value"),
                                                                PriceBaseZM:GetXMLNodeContent(Price,"/@ZM") 
                                                        }))(GetXMLNodes(item, "PriceBase")[0]),
                                                        ...(Price=>({
                                                                PriceCurrValue:GetXMLNodeContent(Price,"/@Value"),
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

                                                })),
                                       wl:[...GetXMLNodes(position, "WorksList/Work")].map((item )=>({ 
                                                Caption:GetXMLNodeContent(item,'/@Caption'),
                                        }))
                                })
                                                )                 
                                        }
                                )(GetXMLNodes(chapter,"Position").filter(item=>{
                 
                if (GetXMLNodeContent(item,"/@Options",'').includes("Inactive")==true){
                    if (GetXMLNodeContent(item,"/@SlaveRow",'').includes("Yes")==false) inactive=true

                    return false
                }
                if ((inactive==true)&& GetXMLNodeContent(item,"/@SlaveRow").includes("Yes")){
                    return false
                }else{
                    inactive=false
                }
                return true
                
            }))
                })
                )                 
                })(GetXMLNodes(root,"Chapters/Chapter")),  
        lz: GetXMLNodes(root,'AddZatrats/AddZatrGlava').map(itm=>(
                GetXMLNodes(itm,'AddZatr').map(lz=>({
                        Glava:GetXMLNodeContent(itm,"/@Glava"),
                        Caption:GetXMLNodeContent(lz,"/@Caption"),
                        Value:GetXMLNodeContent(lz,"/@Value"),
                        Level:GetXMLNodeContent(lz,"/@Level"),
                        Options:GetXMLNodeContent(lz,"/@Options"),
                        Formula:GetXMLNodeContent(lz,"/@Formula")
                }))
        )).flat()      
    }

return result
}

module.exports = GrandToJSON;