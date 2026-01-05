const {GetXMLNodeContent, GetXMLNodes} = require('../utils/UtilsTbls');
const {base_enum, region_enum} = require('../converters/Dictionary');
const ggeBimToJSON =  (xml, filename=undefined)=>{
    let result = {smeta:{},vr:[],index:[]}
    const root=xml.getElementsByTagName("Construction")[0]
    const compareObjects=(obj1, obj2)=> {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        // Проверяем одинаковое ли количество свойств
        if (keys1.length !== keys2.length) return false;
        // Сравниваем каждое свойство
        for (let key of keys1) {
                if (obj1[key] !== obj2[key]) return false;
        }
        return true;
}
    const normativ=((NormId)=>(base_enum.find(item=>(item.NormId==NormId))))(GetXMLNodeContent(root,"Object/Estimate/Legal/Main/Num"))
    result.smeta={
        FileName:filename,
        Generator:GetXMLNodeContent(root,"Meta/Soft/Name"),
        ProgramVersion:GetXMLNodeContent(root,"Meta/Soft/Version"),
        LocNum:GetXMLNodeContent(root,`Object/Num`),
        Object:GetXMLNodeContent(root,`Object/Name`),
        Constr:GetXMLNodeContent(root,`Name`),
        Reason:GetXMLNodeContent(root,`Object/Estimate/Reason`),
        LinkType:'LB',
        BasePriceDate:(GetXMLNodeContent(root,"Object/Estimate/Date/Day"))?
                `${((value)=>(`${'0'.repeat(2-value.length)}${value}`))(GetXMLNodeContent(root,"Object/Estimate/Date/Day"))
                }.${((value)=>(`${'0'.repeat(2-value.length)}${value}`))(GetXMLNodeContent(root,"Object/Estimate/Date/Month"))
                }.${GetXMLNodeContent(root,"Object/Estimate/Date/Year")}`:GetXMLNodeContent(root,"Object/Estimate/PriceLevelBase/Year")?
                `${((value)=>(`${'0'.repeat(2-value.length)}${value}`))(GetXMLNodeContent(root,"Object/Estimate/PriceLevelBase/Day")?GetXMLNodeContent(root,"Object/Estimate/PriceLevelBase/Day"):'1')
                }.${((value)=>(`${'0'.repeat(2-value.length)}${value}`))(GetXMLNodeContent(root,"Object/Estimate/PriceLevelBase/Month"))
                }.${GetXMLNodeContent(root,"Object/Estimate/PriceLevelBase/Year")}`:undefined,
        CurrPriceDate:(()=>{
                const Quarter=Number(GetXMLNodeContent(root,`Object/Estimate/PriceLevelCur/Quarter`))
                if (Quarter==1) return `01.01.${GetXMLNodeContent(root,`Object/Estimate/PriceLevelCur/Year`)}`
                if (Quarter==2) return `01.04.${GetXMLNodeContent(root,`Object/Estimate/PriceLevelCur/Year`)}`    
                if (Quarter==3) return `01.07.${GetXMLNodeContent(root,`Object/Estimate/PriceLevelCur/Year`)}`
                if (Quarter==4) return `01.10.${GetXMLNodeContent(root,`Object/Estimate/PriceLevelCur/Year`)}`
                return undefined
            })() ,
        Options:"AddZatr 2020Mode SeparateFot 2022Mode",
        BasePrices:"2001",
        BaseCalcVrs:"Vr2001",
        TzDigits:"2",
        BlockRoundMode:"Smart",
        MultKPosCalcMode:"UseTotalMult",
        TempZone:"1",
        TsnTempZone:"1",
        MatDigits:"4",
        MatRoundMode:"None",
        PosKDigits:"2",
        ItogOptions:"SeparateVrs IgnoreZeroQty IgnoreZeroPrice",
        FirstItogItem:"K",
        ItogExpandTo:"Default",
        IndexesLinkMode:"Default",
        IndexesMode:(IndexType=>(IndexType=='Индексы к СМР')?'Smr'
                :(IndexType=='Индексы к элементам прямых затрат')?'Total'
                :(IndexType=='Индексы к элементам прямых затрат в позиции')?'PosOne'
                :'None'
        )(GetXMLNodeContent(root,`Object/Estimate/IndexType`)),
        OSChapter:"1",
        Cons:"2",
        Rec:"2",
        Road:"2",
        DocDatesOptions:"CurrFmtQr",
        Index_Info_BaseType:"INFO",
        Wage_Info_BaseType:"INFO",
        Zone01Name:"Базовый район",
        Zone01ID:"1",
        Description:GetXMLNodeContent(root,"Object/Estimate/Name"),
        RegionID:(normativ)?normativ.RegionID:undefined,
        RegionName:(normativ)?normativ.RegionName:undefined,
        NrspFile:(normativ)?normativ.NrspFile:undefined,
        CatFile:(normativ)?normativ.CatFile:undefined,
        //Overhd_OrderDetails:(normativ)?normativ.Overhd_OrderDetails:undefined,
       // Profit_OrderDetails:(normativ)?normativ.Profit_OrderDetails:undefined,
        ...(( AdmRegionCode)=>{
                let result={}
                AdmRegionCode=(AdmRegionCode)?AdmRegionCode:GetXMLNodeContent(root,"Object/Region/Code")
                const arvalue=Number(AdmRegionCode)
                if (!isNaN(arvalue) && (arvalue > 0)){
                        let regionname=GetXMLNodeContent(root,"Object/Estimate/Region/RegionName")
                        regionname=(regionname)?regionname:GetXMLNodeContent(root,"Object/Region/Name")
                        result= {
                                ['AdmRegionCode']:AdmRegionCode,
                                ['AdmRegionName']:(regionname)?regionname:region_enum.find(item=> (String(item.Code)== AdmRegionCode))['Name'],
                                ['AdmRegionZone']:(regionname)?regionname:region_enum.find(item=> (String(item.Code)== AdmRegionCode))['Name']
                        }
                }
                return result     
                })(GetXMLNodeContent(root,"Object/Estimate/Region/RegionCode")),
        ['Index_Info_OrderDetails']:GetXMLNodeContent(root,`Object/Estimate/Legal/Indexes/Orders`),
        ['Wage_Info_OrderDetails']:GetXMLNodeContent(root,`Object/Estimate/Salary`),
        ['ComposeFIO']:GetXMLNodeContent(root,`Object/Estimate/Signatures/ComposeFIO`),
        ['VerifyFIO']:GetXMLNodeContent(root,`Object/Estimate/Signatures/VerifyFIO`),
        ['Overhd_BaseName']:GetXMLNodeContent(root,`Object/Estimate/Legal/Overheads/Name`),
        ['Overhd_OrderDetails']:GetXMLNodeContent(root,`Object/Estimate/Legal/Overheads/Orders`,(normativ)?normativ.Overhd_OrderDetails:undefined),
        ['Overhd_RegNumber']:GetXMLNodeContent(root,`Object/Estimate/Legal/Overheads/Num`),
        ['Overhd_RegDate']:(GetXMLNodeContent(root,"Object/Estimate/Legal/Overheads/Date/Day"))?
            `${((value)=>(`${'0'.repeat(2-value.length)}${value}`))(GetXMLNodeContent(root,"Object/Estimate/Legal/Overheads/Date/Day"))
            }.${((value)=>(`${'0'.repeat(2-value.length)}${value}`))(GetXMLNodeContent(root,"Object/Estimate/Legal/Overheads/Date/Month"))
            }.${GetXMLNodeContent(root,"Object/Estimate/Legal/Overheads/Date/Year")}`:undefined,
        ['Overhd_BaseType']:(()=>{
                let Value=GetXMLNodeContent(root,"Object/Estimate/Legal/Overheads/Type",'')
                        if (Value=="Справочная информация") return "INFO"
                        Value=String(Value).replace('Г','G')
                        .replace('Э','E')
                        .replace('С','S')
                        .replace('Н','N')
                        .replace('Ф','F')
                        .replace('Т','T')
                        .replace('И','I')
                return Value
                })(),
        ['Profit_BaseName']: GetXMLNodeContent(root,"Object/Estimate/Legal/Profits/Name"),
        ['Profit_RegNumber']: GetXMLNodeContent(root,"Object/Estimate/Legal/Profits/Num"),
        ['Profit_OrderDetails']: GetXMLNodeContent(root,"Object/Estimate/Legal/Profits/Orders",(normativ)?normativ.Profit_OrderDetails:undefined),
        ['Profit_RegDate']:
                (GetXMLNodeContent(root,"Object/Estimate/Legal/Profits/Date/Day"))?
                `${((value)=>(`${'0'.repeat(2-value.length)}${value}`))(GetXMLNodeContent(root,"Object/Estimate/Legal/Profits/Date/Day"))
                }.${((value)=>(`${'0'.repeat(2-value.length)}${value}`))(GetXMLNodeContent(root,"Object/Estimate/Legal/Profits/Date/Month"))
                }.${GetXMLNodeContent(root,"Object/Estimate/Legal/Profits/Date/Year")}`:undefined,
        ['Profit_BaseType']: (()=>{
                let Value=GetXMLNodeContent(root,"Object/Estimate/Legal/Profits/Type",'')
                    if (Value=="Справочная информация") return "INFO"
                    Value=String(Value).replace('Г','G')
                    .replace('Э','E')
                    .replace('С','S')
                    .replace('Н','N')
                    .replace('Ф','F')
                    .replace('Т','T')
                    .replace('И','I')
                return Value
                })(),
        ['BaseType']: (()=>{
                let Value=GetXMLNodeContent(root,"Object/Estimate/Legal/Main/Type",'')
                if (Value=="Справочная информация") return "INFO"
                Value=String(Value).replace('Г','G')
                .replace('Э','E')
                .replace('С','S')
                .replace('Н','N')
                .replace('Ф','F')
                .replace('Т','T')
                .replace('И','I')
                return Value
            })(),
        ['BaseName']: GetXMLNodeContent(root,"Object/Estimate/Legal/Main/Name"),
        ['OrderDetails']: GetXMLNodeContent(root,"Object/Estimate/Legal/Main/Orders"),
        ['RegNumber']: GetXMLNodeContent(root,"Object/Estimate/Legal/Main/Num"),
        ['RegDate']:
                (GetXMLNodeContent(root,"Object/Estimate/Legal/Main/Date/Day"))?
                `${((value)=>(`${'0'.repeat(2-value.length)}${value}`))(GetXMLNodeContent(root,"Object/Estimate/Legal/Main/Date/Day"))
                }.${((value)=>(`${'0'.repeat(2-value.length)}${value}`))(GetXMLNodeContent(root,"Object/Estimate/Legal/Main/Date/Month"))
                }.${GetXMLNodeContent(root,"Object/Estimate/Legal/Main/Date/Year")}`:undefined,
        chapter:((chapters)=>{
                if (chapters) return chapters.map(chapter=>({
                        Caption:GetXMLNodeContent(chapter,"Name"),
                        position:((positions)=>{
                                if (positions) return positions.map(position=>({
                                        Code:`${GetXMLNodeContent(position,'Cost/Prefix','')}${
                                                GetXMLNodeContent(position,'Cost/Code',
                                                GetXMLNodeContent(position,'Transport/Code',
                                                GetXMLNodeContent(position,'Equipment/Code',
                                                GetXMLNodeContent(position,'Material/Code'))))}`,
                                        DBComment:(normativ)?normativ.DBComment:undefined,
                                        Number:GetXMLNodeContent(position,'Cost/Num',
                                                GetXMLNodeContent(position,'Transport/Num',
                                                GetXMLNodeContent(position,'Equipment/Num',
                                                GetXMLNodeContent(position,'Material/Num')))),
                                        Caption:GetXMLNodeContent(position,'Cost/Name',
                                                GetXMLNodeContent(position,'Transport/Name',
                                                GetXMLNodeContent(position,'Equipment/Name', 
                                                GetXMLNodeContent(position,'Material/Name')))),
                                        Units:GetXMLNodeContent(position,'Cost/Unit',
                                                GetXMLNodeContent(position,'Transport/Unit',
                                                GetXMLNodeContent(position,'Equipment/Unit', 
                                                GetXMLNodeContent(position,'Material/Unit')))),
                                        vr:(()=>{
                                                const vr={
                                                        Grop_Caption:GetXMLNodeContent(position,'WorkType'),
                                                        NrCode:GetXMLNodeContent(position,'Overheads/Reason'),
                                                        NaclMask:GetXMLNodeContent(position,'Overheads/Target'),
                                                        Caption: GetXMLNodeContent(position,'Overheads/Name',
                                                                GetXMLNodeContent(position,"Transport")? 'Перевозка грузов':
                                                                GetXMLNodeContent(position,"Equipment")? 'Оборудование':
                                                                GetXMLNodeContent(position,"Material") ?'Материал по прайсу':undefined
                                                                ),
                                                        Nacl: GetXMLNodeContent(position,'Overheads/Value'),
                                                        NaclCurr: GetXMLNodeContent(position,'Overheads/Value'),
                                                        SpCode: GetXMLNodeContent(position,'Profits/Reason'),
                                                        PlanMask: GetXMLNodeContent(position,'Profits/Target',"ФОТ"),
                                                        Plan: GetXMLNodeContent(position,'Profits/Value'),
                                                        PlanCurr: GetXMLNodeContent(position,'Profits/Value'),
                                                        Category: GetXMLNodeContent(position,'Overheads/Name',
                                                                GetXMLNodeContent(position,"Transport")? 'Transportation':
                                                                GetXMLNodeContent(position,"Equipment")? 'Equipment':
                                                                GetXMLNodeContent(position,'WorkType').startsWith('Монтажные')? 'Mounting':
                                                                'Construction'),
                                                        OsColumn:GetXMLNodeContent(position,'Equipment')?'О':GetXMLNodeContent(position,'WorkType','').startsWith('Монтажные')?'М':undefined,
                                                        } 
                                                        const id=result.vr.findIndex(item=>(compareObjects(item,vr)))+1
                                                        if (id!==0) return String(id)
                                                        result.vr=[...result.vr,vr]
                                                        return String(result.vr.length)        
                                                })(),
                                        PriceLevel:GetXMLNodeContent(position,'Material')?GetXMLNodes(position,'Material/PricePerUnitBase')?"2001":"Curr":"2001",
                                        Quantity:GetXMLNodeContent(position,'Cost/QuantityTotal',
                                                GetXMLNodeContent(position,'Transport/ConsumptionTotal',
                                                GetXMLNodeContent(position,'Equipment/ConsumptionTotal', 
                                                GetXMLNodeContent(position,'Material/ConsumptionTotal')))
                                                ),
                                        BOZ:GetXMLNodeContent(position,'Cost/PerUnit/Base/WorkersSalary'),
                                        BEM:GetXMLNodeContent(position,'Cost/PerUnit/Base/Machines'),
                                        BZM:GetXMLNodeContent(position,'Cost/PerUnit/Base/MachinistSalary'),
                                        BMT:GetXMLNodeContent(position,'Cost/PerUnit/Base/Materials'),
                                        BPZ:GetXMLNodeContent(position,'Cost/PerUnit/Base/Direct'),
                                        //Options:`${GetXMLNodes(position,'Material')?
                                        //         GetXMLNodes(position,'Material/Index')?`ForcedResIdx`
                                                //       :GetXMLNodes(position,'Material/PricePerUnitBase')?
                                                //      `NotInNB`:'':''} ${GetXMLNodes(position,'Equipment/Index')?'ForcedResIdx':''}`.trim()
                                        
                                        index:((Index)=>{
                                        if (Index){  
                                                const ind={...{
                                                        Type:'Pos',
                                                        Caption: GetXMLNodeContent(Index,'Name'),
                                                        Code: GetXMLNodeContent(Index,'Reason')},
                                                        ...Object.assign({},...GetXMLNodes(Index,'Values/Value').map(item=>(
                                                                (GetXMLNodeContent(item,'Target')=='ОТ')?{OZ:GetXMLNodeContent(item,'Value')}
                                                                :(GetXMLNodeContent(item,'Target')=='ЭМ')?{EM:GetXMLNodeContent(item,'Value')}
                                                                :(GetXMLNodeContent(item,'Target')=='ОТМ')?{ZM:GetXMLNodeContent(item,'Value')}
                                                                :(GetXMLNodeContent(item,'Target')=='М')?{MT:GetXMLNodeContent(item,'Value')}
                                                                :null))),
                                                         ...Object.assign({},...GetXMLNodes(Index,'Value').map(item=>(
                                                                {EM:GetXMLNodeContent(item,'Value'),MT:GetXMLNodeContent(item,'Value')}
                                                                )))
                                                        }
                                                        const id=result.index.findIndex(item=>(compareObjects(item,ind)))+1
                                                        if (id!==0) return String(id)
                                                        result.index=[...result.index,ind]
                                                        return String(result.index.length)
                                                } 
                                                return null                                                                          
                                        })([...GetXMLNodes(position,'Cost/Index'),
                                                ...GetXMLNodes(position,'Transport/Index'),
                                                ...GetXMLNodes(position,'Material/Index')][0]),
                                        ...Object.assign({},(koeffs=>{
                                                let ovk
                                                koeffs.forEach((citm)=>{
                                                        ovk=ovk?`${ovk}*${GetXMLNodeContent(citm,'Value')}`:GetXMLNodeContent(citm,'Value')
                                                })
                                                return {NKB:ovk,NKI:ovk,NKR:ovk}
                                                })(GetXMLNodes(position,'Overheads/Coefficients/Coefficient'))),    
                                        ...Object.assign({},(koeffs=>{
                                                let pk
                                                koeffs.forEach((citm)=>{
                                                        pk=pk?`${pk}*${GetXMLNodeContent(citm,'Value')}`:GetXMLNodeContent(citm,'Value')
                                                })
                                                return {PNB:pk,PKI:pk,PKR:pk}
                                                })(GetXMLNodes(position,'Profits/Coefficients/Coefficient'))),
                                        koeff:((koeffs,finkoeff)=>{
                                        if (koeffs.length==0) return null
                                        const GetValues=item=>(Object.assign({},...GetXMLNodes(item,'Values/Value').map(value=>{
                                                                const target=GetXMLNodeContent(value,"Target")
                                                                        const coefvalue=Number(GetXMLNodeContent(value,"CoefValue"))
                                                                return{
                                                                        ...((target=="ЭМ")||(target=="Стоимость"))?{EM:coefvalue}:undefined,
                                                                        ...(target=="ЗТ")?{TZ:coefvalue}:undefined,
                                                                        ...(target=="ЗТМ")?{TZM:coefvalue}:undefined,
                                                                        ...((target=="ОТ")||(target=="Стоимость"))?{OZ:coefvalue}:undefined,
                                                                        ...((target=="ОТМ")||(target=="Стоимость"))?{ZPM:coefvalue}:undefined,
                                                                        ...((target=="МАТ")||(target=="ОБ")||(target=="Стоимость"))?{MAT:coefvalue}:undefined,
                                                                }
                                                        })))
                                        const ks=koeffs.map(item=>{
                                                return {
                                                        // Name:GetXMLNodeContent(item,"Name"),
                                                        // Reason:GetXMLNodeContent(item,"Reason"),
                                                        ...GetValues(item)
                                                }
                                        })
                                        const fk=(finkoeff.length>0)?GetValues(finkoeff[0]):{}
                                        const addon10=((FinalK, Ks)=>{
                                                let rslt
                                                if (Ks.length==0) return []
                                                const defresult=`${'0'.repeat(Ks.length)}`.split('')
                                                for (var i = 0; i < Math.pow(2,Ks.length); i++) {
                                                const TZ=[1,1,1]
                                                const OZ=[1,1,1]
                                                const EM=[1,1,1]
                                                const ZPM=[1,1,1]
                                                const TZM=[1,1,1]
                                                const MT=[1,1,1]
                                                const mask=i.toString(2)
                                                rslt=`${'0'.repeat(Ks.length-mask.length)}${mask}`.split('')
                                                for (var k = 0; k < Ks.length; k++) {
                                                        //const curval=(k>result.length)?0:result[k]
                                                        const curval=rslt[k]
                                                        if (curval=='1'){
                                                        if (Ks[k].TZ) {
                                                                TZ[0]=TZ[0]+Number(Ks[k].TZ)-1
                                                                OZ[0]=OZ[0]+Number(Ks[k].TZ)-1
                                                        }else if (Ks[k].OZ) {
                                                                OZ[1]=Number((OZ[1]*Ks[k].OZ).toFixed(7))
                                                        }
                                                        if (Ks[k].EM) {
                                                                EM[0]=EM[0]+Number(Ks[k].EM)-1
                                                        }
                                                        if ((Ks[k].ZPM)&&!(Ks[k].TZM)) {
                                                                ZPM[1]=Number((ZPM[1]*Ks[k].ZPM).toFixed(7))
                                                        }
                                                        if (Ks[k].TZM) {
                                                                TZM[0]=TZM[0]+Number(Ks[k].TZM)-1
                                                                ZPM[0]=ZPM[0]+Number(Ks[k].TZM)-1
                                                                }
                                                        }else{
                                                        if (Ks[k].TZ) {
                                                                TZ[2]=Number((TZ[2]*Ks[k].TZ).toFixed(7))
                                                                OZ[2]=Number((OZ[2]*Ks[k].TZ).toFixed(7))
                                                        }else if (Ks[k].OZ) {
                                                                OZ[2]=Number((OZ[2]*Ks[k].OZ).toFixed(7))
                                                        }
                                                        if (Ks[k].EM) {
                                                                EM[2]=Number((EM[2]*Ks[k].EM).toFixed(7))
                                                        }
                                                        if (Ks[k].ZPM) {
                                                                ZPM[2]=Number((ZPM[2]*Ks[k].ZPM).toFixed(7))
                                                        }
                                                        if (Ks[k].TZM) {
                                                                TZM[2]=Number((TZM[2]*Ks[k].TZM).toFixed(7))
                                                                ZPM[2]=Number((ZPM[2]*Ks[k].TZM).toFixed(7))
                                                        }
                                                        } 
                                                }
                                                let ResultK={
                                                        TZ:Number((Number((TZ[0]*TZ[1]).toFixed(2))*TZ[2]).toFixed(7)),
                                                        OZ:Number((Number((OZ[0]*OZ[1]).toFixed(2))*OZ[2]).toFixed(7)),
                                                        EM:Number((Number((EM[0]*EM[1]).toFixed(2))*EM[2]).toFixed(7)),
                                                        ZPM:Number((Number((ZPM[0]*ZPM[1]).toFixed(2))*ZPM[2]).toFixed(7)),
                                                        TZM:Number((Number((TZM[0]*TZM[1]).toFixed(2))*TZM[2]).toFixed(7)),
                                                        MT:Number((Number((MT[0]*MT[1]).toFixed(2))*MT[2]).toFixed(7)),
                                                }
                                                if (
                                                        ((FinalK.TZ==undefined)||(ResultK.TZ==FinalK.TZ))
                                                        &&((FinalK.OZ==undefined)||(ResultK.OZ==FinalK.OZ))
                                                        &&((FinalK.EM==undefined)||(ResultK.EM==FinalK.EM))
                                                        &&((FinalK.ZPM==undefined)||(ResultK.ZPM==FinalK.ZPM))
                                                        &&((FinalK.TZM==undefined)||(ResultK.TZM==FinalK.TZM))
                                                        &&((FinalK.MT==undefined)||(ResultK.MT==FinalK.MT))
                                                ) {
                                                        if (rslt.findIndex(item=>(item=='1'))!==-1) result.smeta['Mode2020Order']='2024'
                                                        return rslt
                                                }
                                                }
                                        return defresult
                                        })(fk,ks)
                                        return koeffs.map((item,ind)=>{
                                                let result ={
                                                        Options:`Base Curr${(addon10[ind]=="1")?' AddOn10':''}`,
                                                        Caption:GetXMLNodeContent(item,"Name"),
                                                        Code:GetXMLNodeContent(item,"Reason"),
                                                        Level:String(ind+1)
                                                }
                                                const values= {
                                                        ...(k=>(Object.assign({},...GetXMLNodes(k,'Values/Value').map(value=>{
                                                                const target=GetXMLNodeContent(value,"Target")
                                                                const coefvalue=GetXMLNodeContent(value,"CoefValue")
                                                                return{
                                                                        ...(target=="ЭМ")?(()=>{
                                                                                result.Options=`${result.Options} EmQty`
                                                                                return {Value_EM:coefvalue}
                                                                                })():undefined,
                                                                        ...(target=="ЗТ")?(()=>{
                                                                                result.Options=`${result.Options} OzpTz`
                                                                                return {Value_OZ:coefvalue}
                                                                                })():undefined,
                                                                        ...(target=="ЗТМ")?(()=>{
                                                                                result.Options=`${result.Options} ZpmTz`
                                                                                return {Value_ZM:coefvalue}
                                                                                })():undefined,
                                                                        ...(target=="ОТ")?(()=>{
                                                                                return {Value_OZ:coefvalue}
                                                                                })():undefined,
                                                                        ...(target=="ОТМ")?(()=>{
                                                                                return {Value_ZM:coefvalue}
                                                                                })():undefined,
                                                                        ...((target=="МАТ")||(target=="ОБ"))?(()=>{
                                                                                result.Options=`${result.Options} MatQty`
                                                                                return {Value_MT:coefvalue}
                                                                                })():undefined,
                                                                        ...(target=="Стоимость")?(()=>{
                                                                                result.Options=`${result.Options} PzAll`
                                                                                return {Value_PZ:coefvalue}
                                                                                })():undefined,
                                                                }
                                                        }))))(item)
                                                }
                                                return {...result,...values}
                                        })
                                        })([...GetXMLNodes(position,'Cost/Coefficients/Coefficient'),
                                        ...GetXMLNodes(position,'Material/Coefficients/Coefficient')],
                                        [...GetXMLNodes(position,'Cost/Coefficients/Final'),
                                        ...GetXMLNodes(position,'Material/Coefficients/Final')]
                                        ),   
                                        resource:(()=>{
                                        let Tzrs=GetXMLNodes(position,"Cost/ResourcesInternal/Worker")
                                                Tzrs=Tzrs.map((res)=>{
                                                if (GetXMLNodeContent(res,'Code')!=='2') return {
                                                        Type:`Tzr`,
                                                        Code:GetXMLNodeContent(res,'Code'),
                                                        Caption:GetXMLNodeContent(res,'Name'),
                                                        Quantity:GetXMLNodeContent(res,'Consumption'),
                                                        Units:GetXMLNodeContent(res,'Unit'),
                                                        PriceBaseValue:GetXMLNodeContent(res,'PricePerUnitBase'),
                                                        WorkClass:((code)=>{
                                                                try{
                                                                const parts=code.split('-')
                                                                if (parts.length==3) return `${parts[1]}.${parts[2]}`
                                                                }catch{}                            
                                                                return undefined
                                                        })(GetXMLNodeContent(res,'Code')),
                                                }
                                                return undefined                                                        
                                                })
                                        const Tzm=(tzm=>(tzm?[{
                                                Type:`Tzm`,
                                                Caption:`Затраты труда машинистов`,
                                                Code:`2`,
                                                Units:`чел.-ч`,
                                                Quantity:tzm}]:[])
                                                )(GetXMLNodeContent(position,'Cost/PerUnit/Natural/MachinistLaborCosts'))
                                        let Mchs=GetXMLNodes(position,"Cost/ResourcesInternal/Machine")
                                        Mchs=Mchs.map((res)=>{
                                                return {
                                                Type:`Mch`,    
                                                Code:GetXMLNodeContent(res,'Code'),
                                                Caption:GetXMLNodeContent(res,'Name'),
                                                Quantity:GetXMLNodeContent(res,'Consumption'),
                                                Units:GetXMLNodeContent(res,'Unit'),
                                                PriceBaseValue:GetXMLNodeContent(res,'PricePerUnitBase'),
                                                PriceCurrValue:GetXMLNodeContent(res,'PricePerUnitCur')
                                                }
                                        }) 
                                        let Mats=GetXMLNodes(position,"Cost/ResourcesInternal/Material")
                                        Mats=Mats.map((res)=>{
                                                return {
                                                        Type:`Mat`,    
                                                        Code:GetXMLNodeContent(res,'Code'),
                                                        Caption:GetXMLNodeContent(res,'Name'),
                                                        Quantity:GetXMLNodeContent(res,'Consumption'),
                                                        Units:GetXMLNodeContent(res,'Unit'),
                                                        PriceBaseValue:GetXMLNodeContent(res,'PricePerUnitBase'),
                                                        PriceCurrValue:GetXMLNodeContent(res,'PricePerUnitCur'),
                                                }
                                        })                                                         
                                        //const ress=[...Tzrs,Tzm,...Mchs,...Mats]
                                        //return (ress.length==0)?undefined:ress
                                        return [...Tzrs,Tzm,...Mchs,...Mats]
                                        })()                  
                                })
                                                )                 
                                        }
                                )(GetXMLNodes(chapter,"Items/Item"))
                })
                )                 
                })(GetXMLNodes(root,"Object/Estimate/Sections/Section")),        
    }

 
return result
}

module.exports = ggeBimToJSON;