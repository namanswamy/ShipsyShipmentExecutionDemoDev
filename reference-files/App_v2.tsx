import { useState, useMemo, CSSProperties } from "react";

/* ═══════════════════════════════════════════════════════════════
   EXIM Manage Tasks — Fields from shipment-execution-workflow.constants.ts
   Paste into App.tsx in CodeSandbox. Zero extra deps needed.
   ═══════════════════════════════════════════════════════════════ */

interface Field { label:string; code?:string; value:string; type:string; req:boolean; opts?:string[]; note?:string; defaultVal?:string; }
interface Task { id:number; name:string; org:string; code:string; team:string; ms:string; assignee:string; approved:boolean; isNew?:boolean; fields:Field[]; docFields?:Field[]; docName?:string; }

const tasks: Task[] = [
  // ═══ DRAFTS ═══
  {id:1,name:"Select Mode Of Shipment",org:"Shipper",code:"SMT25",team:"Ops",ms:"Drafts",assignee:"Reliance",approved:false,fields:[
    {label:"Mode",code:"SMF87",value:"FCL",type:"dropdown",req:true,opts:["FCL","LCL","AIR","BULK (MR)","BREAK BULK (MB)"],defaultVal:"FCL"},
    {label:"Incoterm",code:"SMF88",value:"EXW",type:"dropdown",req:true,opts:["EXW","FCA","CPT","CIP","DAP","DPU","DDP","FAS","FOB","CFR","CIF"],defaultVal:"EXW"},
    {label:"Spot / Normal",value:"Normal",type:"dropdown",req:true,opts:["Spot","Normal"],defaultVal:"Normal",note:"NEW"},
  ]},
  {id:2,name:"Select Port Details",org:"Shipper",code:"SMT7",team:"Ops",ms:"Drafts",assignee:"Reliance",approved:false,fields:[
    {label:"Place of Receipt at Origin",code:"SMF103",value:"",type:"dropdown",req:true},
    {label:"Port of Loading",code:"SMF4",value:"",type:"dropdown",req:true},
    {label:"Port of Discharge",code:"SMF5",value:"",type:"dropdown",req:true},
    {label:"Destination Port",code:"SMF3",value:"",type:"dropdown",req:true},
  ]},
  {id:3,name:"Enter Container Details",org:"Shipper",code:"SMT8",team:"Ops",ms:"Drafts",assignee:"Reliance",approved:false,fields:[
    {label:"Container Details",code:"SMF9",value:"",type:"text",req:true},
    {label:"Container Type",code:"SMF10",value:"",type:"dropdown",req:false},
    {label:"Container Size",code:"SMF11",value:"",type:"dropdown",req:false},
    {label:"Container Count",code:"SMF12",value:"",type:"number",req:false},
    {label:"Container Total Weight",code:"SMF13",value:"",type:"number",req:false},
    {label:"Container Weight Unit",code:"SMF14",value:"",type:"dropdown",req:false},
  ]},
  {id:4,name:"Vendor Selection",org:"Shipper",code:"TBD",team:"Ops",ms:"Drafts",assignee:"Reliance",approved:false,isNew:true,fields:[
    {label:"Vendor Selection",value:"",type:"addmore",req:true,opts:["Freight Forwarder","Shipping Line","CHA","CFS","ICD","Break Bulk Vendor","Surveyor","Transporter"],note:"+ Add More for multi-value. CFS/ICD mutually exclusive."},
    {label:"Segment",value:"",type:"dropdown",req:false,opts:["DPD","DPD CFS","Non DPD"],note:"If CFS/ICD selected"},
    {label:"Category",value:"",type:"dropdown",req:false,opts:["General In-gauge","General Out-gauge","Haz cargo","Reefer"],note:"If CFS/ICD selected"},
    {label:"Destuff Indicator",value:"",type:"dropdown",req:false,opts:["Loaded","Destuffed"],note:"If CFS/ICD selected"},
    {label:"Panel Identifier",value:"",type:"dropdown",req:false,opts:["Panel Lines (Off dock)","Panel Lines (Non off dock)","Non Panel Lines"],note:"If CFS/ICD selected"},
    {label:"Buffer Days",value:"14 days",type:"dropdown",req:false,opts:["7 days","14 days","21 days"],defaultVal:"14 days",note:"If CFS/ICD selected"},
  ]},
  {id:5,name:"Run Global Plan Optimizer",org:"Shipper",code:"SMT10",team:"Ops",ms:"Drafts",assignee:"Reliance",approved:true,fields:[
    {label:"Bid Details",code:"SMF27",value:"",type:"text",req:true},
    {label:"Bid Rank",code:"SMF28",value:"",type:"number",req:false},
    {label:"Bid Validity Start",code:"SMF29",value:"",type:"date",req:false},
    {label:"Bid Validity End",code:"SMF30",value:"",type:"date",req:false},
  ]},
  {id:6,name:"Approval For L1 Deviation",org:"Shipper",code:"SMT11",team:"Ops",ms:"Drafts",assignee:"Reliance",approved:true,fields:[
    {label:"Bid Details",code:"SMF27",value:"",type:"text",req:true},
    {label:"Reason for Deviation",value:"",type:"dropdown",req:true,note:"NEW"},
    {label:"Remark",value:"",type:"text",req:false,note:"NEW"},
  ]},
  // ═══ ORIGIN — Shipper ═══
  {id:7,name:"Select Sailing Schedule",org:"Shipper",code:"SMT12",team:"Ops",ms:"Origin",assignee:"Reliance",approved:false,fields:[
    {label:"Sailing Schedule Details",code:"SMF31",value:"",type:"text",req:true},
    {label:"Sailing Date as per Schedule",code:"SMF32",value:"",type:"date",req:false},
    {label:"Vessel Name as per Schedule",code:"SMF33",value:"",type:"text",req:false},
  ]},
  {id:10,name:"Approve Booking Note",org:"Shipper",code:"SMT16",team:"Ops",ms:"Origin",assignee:"Reliance",approved:true,fields:[
    {label:"Booking Number",code:"SMF34",value:"",type:"text",req:true},
    {label:"Sailing Date as per BN",code:"SMF35",value:"",type:"date",req:true},
    {label:"Vessel Name as per BN",code:"SMF36",value:"",type:"text",req:true},
    {label:"VGM Cut-off",code:"SMF37",value:"",type:"datetime",req:true},
    {label:"Gate Open",code:"SMF38",value:"",type:"datetime",req:true},
    {label:"Document Cut-off",code:"SMF39",value:"",type:"datetime",req:true},
    {label:"Bill Validity",code:"SMF40",value:"",type:"date",req:true},
    {label:"Gate-in Cut-off",code:"SMF41",value:"",type:"datetime",req:true},
    {label:"SI Cut-off",code:"SMF42",value:"",type:"datetime",req:true},
    {label:"Yard Details",code:"SMF43",value:"",type:"text",req:true},
  ]},
  {id:15,name:"Approve Draft BL",org:"Shipper",code:"SMT5",team:"Ops",ms:"Origin",assignee:"Reliance",approved:true,fields:[
    {label:"(Negotiable soft approval)",value:"No hardcoded fields — driven by workflow/org config",type:"auto",req:false},
  ]},
  // ═══ IN TRANSIT — Shipper ═══
  {id:17,name:"Approve Final BL",org:"Shipper",code:"SMT29",team:"Ops",ms:"In Transit",assignee:"Reliance",approved:true,fields:[
    {label:"(Soft-approval task)",value:"No hardcoded fields in codebase",type:"auto",req:false},
  ]},
  {id:18,name:"Courier Docket Details Upload",org:"Shipper",code:"SMT23",team:"Ops",ms:"In Transit",assignee:"Reliance",approved:false,fields:[
    {label:"AWB Number",code:"SMF81",value:"",type:"text",req:true},
    {label:"Courier Company",code:"SMF82",value:"",type:"text",req:true},
    {label:"Courier Receiving Address",code:"SMF83",value:"",type:"text",req:true},
  ]},
  // ═══ DESTINATION — Shipper ═══
  {id:20,name:"Upload Bill of Entry Details",org:"Shipper",code:"SMT24",team:"Ops",ms:"Destination",assignee:"Reliance",approved:false,fields:[
    {label:"BOE Number",code:"SMF84",value:"",type:"text",req:true},
    {label:"BOE Entry Port",code:"SMF85",value:"",type:"text",req:true},
    {label:"BOE Entry Date",code:"SMF86",value:"",type:"date",req:true},
  ]},
  {id:22,name:"Vehicle Loading Confirmation",org:"Shipper",code:"SMT3",team:"Ops",ms:"Destination",assignee:"Reliance",approved:false,fields:[
    {label:"Container Loaded At",value:"",type:"text",req:false,note:"Negotiable document task"},
  ]},
  {id:23,name:"Detention Free Time",org:"Shipper",code:"TBD",team:"Ops",ms:"Destination",assignee:"Reliance",approved:false,isNew:true,fields:[
    {label:"Detention Free Time",value:"",type:"text",req:true},
  ]},
  {id:26,name:"Confirm CFS Vendor",org:"Shipper",code:"TBD",team:"Ops",ms:"Destination",assignee:"Reliance",approved:false,isNew:true,fields:[{label:"CFS Vendors",value:"",type:"dropdown",req:true}]},
  {id:31,name:"Confirm ICD Vendor",org:"Shipper",code:"TBD",team:"Ops",ms:"Destination",assignee:"Reliance",approved:false,isNew:true,fields:[{label:"ICD Vendors",value:"",type:"dropdown",req:true}]},
  {id:36,name:"Transporter Confirmation",org:"Shipper",code:"TBD",team:"Ops",ms:"Destination",assignee:"Reliance",approved:false,isNew:true,fields:[{label:"Transporter",value:"",type:"dropdown",req:true}]},

  // ═══ ORIGIN — FF ═══
  {id:8,name:"Confirm Sailing Schedule",org:"FF",code:"SMT13",team:"",ms:"Origin",assignee:"FF Vendor",approved:false,fields:[
    {label:"Sailing Schedule Details",code:"SMF31",value:"",type:"text",req:true},
    {label:"Sailing Date as per Schedule",code:"SMF32",value:"",type:"date",req:false},
    {label:"Vessel Name as per Schedule",code:"SMF33",value:"",type:"text",req:false},
  ]},
  {id:9,name:"Upload Booking Note (FCL)",org:"FF",code:"SMT32",team:"",ms:"Origin",assignee:"FF Vendor",approved:false,docName:"Booking Note (FCL)",
    fields:[{label:"Booking Date Info same as Sailing Schedule",code:"SMF96",value:"",type:"text",req:false}],
    docFields:[
      {label:"Booking Number",code:"SMF34",value:"",type:"text",req:true},
      {label:"Sailing Date",code:"SMF112",value:"",type:"date",req:false},
      {label:"Number of Containers",code:"SMF111",value:"",type:"number",req:false},
      {label:"Bill Validity",code:"SMF40",value:"",type:"date",req:false},
      {label:"SI Cut-off",code:"SMF42",value:"",type:"datetime",req:false},
      {label:"Document Cut-off",code:"SMF39",value:"",type:"datetime",req:false},
      {label:"VGM Cut-off",code:"SMF37",value:"",type:"datetime",req:false},
      {label:"Gate Open",code:"SMF38",value:"",type:"datetime",req:false},
      {label:"Gate-in Cut-off",code:"SMF41",value:"",type:"datetime",req:false},
      {label:"Vessel Name",code:"SMF110",value:"",type:"text",req:false},
      {label:"Yard Details",code:"SMF43",value:"",type:"text",req:false},
      {label:"Arrival Date",code:"SMF89",value:"",type:"date",req:false},
    ]},
  {id:11,name:"Empty Container Pickup Details",org:"FF",code:"SMT2",team:"",ms:"Origin",assignee:"FF Vendor",approved:false,fields:[
    {label:"Empty Container Pickup Date",value:"",type:"date",req:true,note:"Negotiable — no hardcoded fields"},
  ]},
  {id:12,name:"Enter Container Weight Details",org:"FF",code:"SMT20",team:"",ms:"Origin",assignee:"FF Vendor",approved:false,fields:[
    {label:"Gross Weight",code:"SMF62",value:"",type:"number",req:true},
    {label:"Net Weight",code:"SMF63",value:"",type:"number",req:true},
    {label:"Tare Weight",code:"SMF64",value:"",type:"number",req:true},
    {label:"UOM",code:"SMF65",value:"",type:"dropdown",req:true},
    {label:"Seal Number",code:"SMF66",value:"",type:"text",req:true},
    {label:"Container Type as per Tracking",code:"SMF108",value:"",type:"text",req:true},
    {label:"Container Size as per Tracking",code:"SMF109",value:"",type:"text",req:true},
  ]},
  {id:13,name:"Upload Commercial Invoice & Packing List",org:"FF",code:"SMT3",team:"",ms:"Origin",assignee:"FF Vendor",approved:false,fields:[
    {label:"Commercial Invoice",value:"",type:"upload",req:true,note:"Negotiable document task"},
    {label:"Packing List",value:"",type:"upload",req:true},
  ]},
  {id:14,name:"Upload Draft BL",org:"FF",code:"SMT3",team:"",ms:"Origin",assignee:"FF Vendor",approved:true,fields:[
    {label:"Draft BL",value:"",type:"upload",req:true,note:"Negotiable document task"},
  ]},
  // ═══ IN TRANSIT — FF ═══
  {id:16,name:"Upload Final BL & Freight Certificate",org:"FF",code:"SMT19",team:"",ms:"In Transit",assignee:"FF Vendor",approved:true,docName:"Final BL (FCL)",fields:[],
    docFields:[
      {label:"House BL Number",code:"SMF55",value:"",type:"text",req:true},
      {label:"House BL Date",code:"SMF56",value:"",type:"date",req:true},
      {label:"Master BL Number",code:"SMF45",value:"",type:"text",req:true},
      {label:"Master BL Date",code:"SMF46",value:"",type:"date",req:true},
      {label:"Container Number List",code:"SMF61",value:"",type:"text",req:true},
      {label:"Actual Departure Date",code:"SMF93",value:"",type:"date",req:true},
      {label:"Vessel Name as per BL",code:"SMF53",value:"",type:"text",req:true},
      {label:"Vessel Number",code:"SMF58",value:"",type:"text",req:true},
      {label:"Voyage No",code:"SMF54",value:"",type:"text",req:true},
      {label:"Net Weight per BL",code:"SMF51",value:"",type:"number",req:true},
      {label:"Net Weight per BL UOM",code:"SMF52",value:"",type:"dropdown",req:true},
      {label:"Gross Weight per BL",code:"SMF49",value:"",type:"number",req:true},
      {label:"Gross Weight per BL UOM",code:"SMF50",value:"",type:"dropdown",req:true},
      {label:"Destination Arrival Date",code:"SMF135",value:"",type:"date",req:true},
    ]},
  {id:19,name:"Upload Cargo Arrival Notice",org:"FF",code:"SMT22",team:"",ms:"In Transit",assignee:"FF Vendor",approved:false,docName:"CAN",fields:[],
    docFields:[
      {label:"IGM Number",code:"SMF74",value:"",type:"text",req:true},
      {label:"IGM Item Number",code:"SMF75",value:"",type:"text",req:true},
      {label:"IGM Sub-item Number",code:"SMF76",value:"",type:"text",req:true},
      {label:"Inward Entry Date",code:"SMF79",value:"",type:"date",req:true},
      {label:"Gateway IGM Date",code:"SMF80",value:"",type:"date",req:true},
      {label:"Vessel IMO",code:"SMF78",value:"",type:"text",req:true},
      {label:"Vessel Code",code:"SMF77",value:"",type:"text",req:true},
    ]},
  // ═══ DESTINATION — FF ═══
  {id:21,name:"Upload Delivery Order",org:"FF",code:"SMT21",team:"",ms:"Destination",assignee:"FF Vendor",approved:false,docName:"DO",fields:[],
    docFields:[
      {label:"DO Number",code:"SMF67",value:"",type:"text",req:true},
      {label:"DO Date",code:"SMF68",value:"",type:"date",req:true},
      {label:"BL Number List",code:"SMF73",value:"",type:"text",req:true},
      {label:"DO Expiry Time",code:"SMF70",value:"",type:"datetime",req:true},
      {label:"Detention Free Expiry Time",code:"SMF69",value:"",type:"datetime",req:true},
      {label:"Laden Container Yard",code:"SMF72",value:"",type:"text",req:true},
      {label:"Empty Container Yard",code:"SMF71",value:"",type:"text",req:true},
    ]},
  {id:24,name:"FF Incidental Events",org:"FF",code:"TBD",team:"",ms:"Destination",assignee:"FF Vendor",approved:false,isNew:true,fields:[
    {label:"Incidental Charges",value:"",type:"addmore",req:true,note:"Vendor-specific from Charge Master"},
    {label:"Type of Charge",value:"Auto-fill",type:"auto",req:false,note:"Incidental / Self-Reimb / Third-Party"},
  ]},
  // ═══ CHA ═══
  {id:25,name:"CHA Incidental Events",org:"CHA",code:"TBD",team:"",ms:"Destination",assignee:"CHA Vendor",approved:false,isNew:true,fields:[
    {label:"Incidental Charges",value:"",type:"addmore",req:true,note:"Vendor-specific from Charge Master"},
    {label:"Type of Charge",value:"Auto-fill",type:"auto",req:false,note:"Incidental / Self-Reimb / Third-Party"},
  ]},
  // ═══ CFS ═══
  {id:27,name:"CFS Gate In Date & Time",org:"CFS",code:"TBD",team:"",ms:"Destination",assignee:"CFS Vendor",approved:false,isNew:true,fields:[{label:"CFS Gate In Date & Time",value:"",type:"datetime",req:true}]},
  {id:28,name:"CFS Destuff Indicator Confirmation",org:"CFS",code:"TBD",team:"",ms:"Destination",assignee:"CFS Vendor",approved:false,isNew:true,fields:[{label:"CFS Destuff Indicator",value:"",type:"text",req:true}]},
  {id:29,name:"CFS Gate Out Date & Time",org:"CFS",code:"TBD",team:"",ms:"Destination",assignee:"CFS Vendor",approved:false,isNew:true,fields:[{label:"CFS Gate Out Date & Time",value:"",type:"datetime",req:true}]},
  {id:30,name:"CFS Incidental Events",org:"CFS",code:"TBD",team:"",ms:"Destination",assignee:"CFS Vendor",approved:false,isNew:true,fields:[
    {label:"Incidental Charges",value:"",type:"addmore",req:true,note:"Vendor-specific from Charge Master"},
    {label:"Type of Charge",value:"Auto-fill",type:"auto",req:false},
  ]},
  // ═══ ICD ═══
  {id:32,name:"ICD Gate In Date & Time",org:"ICD",code:"TBD",team:"",ms:"Destination",assignee:"ICD Vendor",approved:false,isNew:true,fields:[{label:"ICD Gate In Date & Time",value:"",type:"datetime",req:true}]},
  {id:33,name:"ICD Destuff Indicator Confirmation",org:"ICD",code:"TBD",team:"",ms:"Destination",assignee:"ICD Vendor",approved:false,isNew:true,fields:[{label:"ICD Destuff Indicator",value:"",type:"text",req:true}]},
  {id:34,name:"ICD Gate Out Date & Time",org:"ICD",code:"TBD",team:"",ms:"Destination",assignee:"ICD Vendor",approved:false,isNew:true,fields:[{label:"ICD Gate Out Date & Time",value:"",type:"datetime",req:true}]},
  {id:35,name:"ICD Incidental Events",org:"ICD",code:"TBD",team:"",ms:"Destination",assignee:"ICD Vendor",approved:false,isNew:true,fields:[
    {label:"Incidental Charges",value:"",type:"addmore",req:true,note:"Vendor-specific from Charge Master"},
    {label:"Type of Charge",value:"Auto-fill",type:"auto",req:false},
  ]},
  // ═══ TRANSPORTER ═══
  {id:37,name:"Carrier Confirmation",org:"Transporter",code:"TBD",team:"",ms:"Destination",assignee:"Transporter",approved:false,isNew:true,fields:[
    {label:"Carrier Confirmation Status",value:"",type:"dropdown",req:true,opts:["Confirmed","Pending","Rejected"]},
    {label:"Vehicle Number",value:"",type:"text",req:true},{label:"Driver Name",value:"",type:"text",req:true},{label:"Driver Mobile",value:"",type:"text",req:true},
  ]},
  {id:38,name:"Consignment Note & Eway Bill",org:"Transporter",code:"TBD",team:"",ms:"Destination",assignee:"Transporter",approved:false,isNew:true,fields:[
    {label:"Consignment Note",value:"",type:"text",req:true},{label:"Eway Bill Number",value:"",type:"text",req:true},
  ]},
  {id:39,name:"Empty Container Return Details",org:"Transporter",code:"TBD",team:"",ms:"Destination",assignee:"Transporter",approved:false,isNew:true,fields:[{label:"Empty Container Return Date",value:"",type:"date",req:true}]},
  {id:40,name:"Transporter Incidental Events",org:"Transporter",code:"TBD",team:"",ms:"Destination",assignee:"Transporter",approved:false,isNew:true,fields:[
    {label:"Incidental Charges",value:"",type:"addmore",req:true,note:"Vendor-specific from Charge Master"},
    {label:"Type of Charge",value:"Auto-fill",type:"auto",req:false},
  ]},
];

const personas=[{id:"Shipper",label:"Shipper (Ops)"},{id:"FF",label:"Freight Forwarder"},{id:"CHA",label:"CHA"},{id:"CFS",label:"CFS"},{id:"ICD",label:"ICD"},{id:"Transporter",label:"Transporter"}];
const milestones=["Drafts","Origin","In Transit","Destination"];
const STATUS_OPTS=[{v:"Not Started",bg:"#F4F4F4",c:"#555"},{v:"In Progress",bg:"#FFFED2",c:"#8B7000"},{v:"Done",bg:"#D3FFEA",c:"#0F6E3C"},{v:"Cancelled",bg:"#FFD3D3",c:"#A00"}];

function AddMoreField({f}:{f:Field}){
  const[rows,setRows]=useState([""]);
  return(<div>
    {rows.map((_,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
      <select style={{flex:1,height:32,border:"1px solid #d9d9d9",borderRadius:4,padding:"0 10px",fontSize:13,background:"#fff"}}><option value="">Select...</option>
        {(f.opts||[]).map(o=><option key={o} value={o}>{o}</option>)}</select>
      {rows.length>1&&<span onClick={()=>setRows(rows.filter((__,j)=>j!==i))} style={{color:"#ff4d4f",cursor:"pointer",fontSize:18,lineHeight:"1",fontWeight:300}}>✕</span>}
    </div>))}
    <div onClick={()=>setRows([...rows,""])} style={{color:"#006EC3",fontSize:12,fontWeight:600,cursor:"pointer",padding:"4px 0",display:"inline-flex",alignItems:"center",gap:4}}>
      <span style={{fontSize:16,lineHeight:"1"}}>+</span> Add More</div>
  </div>);
}

function FieldInput({f}:{f:Field}){
  const base:CSSProperties={width:"100%",height:32,border:"1px solid #d9d9d9",borderRadius:4,padding:"0 10px",fontSize:13,color:"#333",boxSizing:"border-box" as const,fontFamily:"inherit",outline:"none"};
  if(f.type==="auto")return<div style={{color:"#999",fontSize:13,fontStyle:"italic",padding:"6px 0"}}>{f.value||"Auto-populated"}</div>;
  if(f.type==="upload")return<button style={{height:32,border:"1px solid #999",borderRadius:4,background:"#fff",padding:"0 14px",fontSize:12,cursor:"pointer",fontWeight:600,color:"#111"}}>⬆ Choose file</button>;
  if(f.type==="addmore")return<AddMoreField f={f}/>;
  if(f.type==="dropdown"||f.type==="multiselect")return(<select defaultValue={f.defaultVal||""} style={{...base,background:"#fff",cursor:"pointer"}}>
    {!f.defaultVal&&<option value="" disabled>Select...</option>}{(f.opts||[]).map(o=><option key={o} value={o}>{o}</option>)}</select>);
  if(f.type==="date"||f.type==="datetime")return<input type={f.type==="datetime"?"datetime-local":"date"} style={base}/>;
  return<input type={f.type==="number"?"number":"text"} placeholder="Enter value" style={base}/>;
}

export default function App(){
  const[activePersona,setActivePersona]=useState("Shipper");
  const[openTask,setOpenTask]=useState<number|null>(null);
  const[activeTab,setActiveTab]=useState("tasks");
  const[statuses,setStatuses]=useState<Record<number,string>>({});
  const[collapsed,setCollapsed]=useState<Record<string,boolean>>({});
  const[markDone,setMarkDone]=useState(true);
  const personaTasks=useMemo(()=>tasks.filter(t=>t.org===activePersona),[activePersona]);
  const grouped=useMemo(()=>{const g:Record<string,Task[]>={};milestones.forEach(m=>{g[m]=personaTasks.filter(t=>t.ms===m)});return g},[personaTasks]);
  const getStatus=(id:number)=>statuses[id]||"Not Started";

  if(openTask){
    const task=tasks.find(t=>t.id===openTask)!;
    const allF=task.fields||[];const docF=task.docFields||[];const hasF=allF.length>0||docF.length>0;
    return(<div style={{fontFamily:"'Open Sans',system-ui,sans-serif",background:"#fff",minHeight:"100vh"}}>
      <div style={{borderBottom:"1px solid #F7F7F7",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,flexWrap:"wrap"}}>
          <span onClick={()=>setOpenTask(null)} style={{cursor:"pointer",fontSize:18,color:"#333",fontWeight:300,lineHeight:"1"}}>✕</span>
          <span style={{fontWeight:700,fontSize:16,color:"#111"}}>{task.name}</span>
          <span style={{color:"#bbb",fontSize:14,cursor:"pointer"}}>✎</span>
          <span style={{fontSize:11,background:task.code==="TBD"?"#FFF3E0":"#E3F2FD",color:task.code==="TBD"?"#E65100":"#1565C0",padding:"1px 6px",borderRadius:3,fontWeight:600}}>{task.code}</span>
          <span style={{marginLeft:8}}><span style={{fontSize:10,color:"#333",marginRight:4}}>Deadline:</span><span style={{color:"red",fontStyle:"italic",fontSize:10}}>20 Jan 2026</span></span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {task.approved?(<><button style={{height:32,padding:"0 16px",border:"1px solid #ff4d4f",borderRadius:4,background:"#fff",color:"#ff4d4f",fontSize:13,cursor:"pointer",fontWeight:600}}>Reject</button>
            <button style={{height:32,padding:"0 16px",border:"none",borderRadius:4,background:"#0F8E4E",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:600}}>Approve</button></>):(<>
            <label style={{fontSize:10,color:"#333",display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}><input type="checkbox" checked={markDone} onChange={e=>setMarkDone(e.target.checked)}/>Mark this task as done automatically?</label>
            <button style={{height:32,padding:"0 20px",border:"none",borderRadius:4,background:"#006EC3",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:600}}>Submit</button></>)}
        </div>
      </div>
      <div style={{padding:"24px 20px 40px"}}>
        {!hasF?<div style={{color:"#999",fontSize:14,padding:"24px 0",textAlign:"center"}}>System task ({task.code}) — fields rendered by platform</div>:(
          <>{allF.length>0&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px 40px"}}>
            {allF.map((f,i)=>(<div key={i} style={f.type==="addmore"?{gridColumn:"1 / -1"}:{}}>
              <div style={{fontSize:13,color:"#666",marginBottom:6,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
                {f.label}{f.req&&<span style={{color:"#E53935"}}>*</span>}
                {f.code&&<span style={{fontSize:9,color:"#999",background:"#f5f5f5",padding:"0 4px",borderRadius:2}}>{f.code}</span>}
                {f.note&&<span style={{fontSize:10,background:task.isNew?"#FFF3E0":"#E3F2FD",color:task.isNew?"#E65100":"#1565C0",padding:"1px 5px",borderRadius:3,fontWeight:600}}>{f.note}</span>}
              </div><FieldInput f={f}/></div>))}</div>)}
          {docF.length>0&&(<div style={{marginTop:24}}>
            <div style={{padding:"8px 12px",background:"#F5F5F5",borderRadius:"4px 4px 0 0",borderBottom:"2px solid #006EC3",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,fontWeight:700,color:"#111"}}>📄 Document: {task.docName}</span>
              <span style={{fontSize:10,color:"#666"}}>(Document-linked fields)</span></div>
            <div style={{border:"1px solid #eee",borderTop:"none",borderRadius:"0 0 4px 4px",padding:"16px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 40px"}}>
                {docF.map((f,i)=>(<div key={i}>
                  <div style={{fontSize:13,color:"#666",marginBottom:6,display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
                    {f.label}{f.req&&<span style={{color:"#E53935"}}>*</span>}
                    {f.code&&<span style={{fontSize:9,color:"#999",background:"#f5f5f5",padding:"0 4px",borderRadius:2}}>{f.code}</span>}
                  </div><FieldInput f={f}/></div>))}</div></div></div>)}</>)}
      </div>
    </div>);
  }

  const tabBtn=(key:string):CSSProperties=>({padding:"12px 16px",fontSize:14,fontWeight:activeTab===key?700:400,color:activeTab===key?"#111":"#999",background:"none",border:"none",cursor:"pointer",borderBottom:activeTab===key?"3px solid #006EC3":"3px solid transparent"});

  return(<div style={{fontFamily:"'Open Sans',system-ui,sans-serif",background:"#F1EEE7",minHeight:"100vh"}}>
    <div style={{background:"#fff",borderBottom:"1px solid #e8e8e8",padding:"10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <span style={{fontSize:18,fontWeight:600,color:"#111"}}>Manage Tasks</span>
      <div style={{display:"flex",gap:10}}>
        <button style={{height:28,padding:"0 12px",border:"1px solid #999",borderRadius:4,background:"transparent",fontSize:12,cursor:"pointer",color:"#111"}}>Reports</button>
        <button style={{height:28,padding:"0 12px",border:"none",borderRadius:4,background:"#006EC3",fontSize:12,cursor:"pointer",color:"#fff",fontWeight:500}}>New Shipment</button></div></div>
    <div style={{background:"rgba(255,255,255,0.92)",padding:"0 18px",borderBottom:"1px solid #e8e8e8",display:"flex",alignItems:"center",gap:4,overflowX:"auto"}}>
      <span style={{fontSize:12,fontWeight:700,color:"#333",marginRight:8,whiteSpace:"nowrap"}}>Persona:</span>
      {personas.map(p=>(<button key={p.id} onClick={()=>{setActivePersona(p.id);setOpenTask(null);setCollapsed({})}}
        style={{padding:"10px 14px",fontSize:13,fontWeight:activePersona===p.id?700:400,color:activePersona===p.id?"#006EC3":"#666",background:"none",border:"none",borderBottom:activePersona===p.id?"3px solid #006EC3":"3px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}}>{p.label}</button>))}</div>
    <div style={{margin:10,background:"#fff",boxShadow:"0 1px 2px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",borderBottom:"1px solid #e8e8e8",alignItems:"center"}}>
        <div style={{display:"flex",flex:1}}>{["tasks","documents","details","tracking","docreq"].map(t=>(
          <button key={t} style={tabBtn(t)} onClick={()=>setActiveTab(t)}>{t==="docreq"?"Document Request":t.charAt(0).toUpperCase()+t.slice(1)}</button>))}</div>
        <div style={{padding:"0 12px",display:"flex",gap:12,color:"#666",fontSize:16}}><span style={{cursor:"pointer"}}>☰</span><span style={{cursor:"pointer"}}>⋯</span></div></div>
      <div style={{background:"#F1EEE8",minHeight:400,paddingBottom:40}}>
        {activeTab!=="tasks"&&<div style={{padding:48,textAlign:"center",color:"#999",fontSize:14}}>Switch to <b>Tasks</b> tab.</div>}
        {activeTab==="tasks"&&milestones.map(ms=>{
          const msTasks=grouped[ms]||[];if(msTasks.length===0)return null;
          const total=msTasks.length;const done=msTasks.filter(t=>getStatus(t.id)==="Done").length;
          const isOpen=!collapsed[ms];const headerBg=done===total&&total>0?"#DBF3E5":"#EDEDED";
          return(<div key={ms} style={{marginBottom:4}}>
            <div onClick={()=>setCollapsed({...collapsed,[ms]:isOpen})} style={{background:headerBg,padding:"10px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #e8e8e8"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:"#999",display:"inline-block",transform:isOpen?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s"}}>▾</span>
                <span style={{fontSize:14,fontWeight:600,color:"#111",minWidth:72}}>{ms}</span>
                <span style={{fontSize:8,color:"#333",marginLeft:16}}>Tasks Done:</span>
                <span style={{fontSize:12,fontWeight:600}}>{done}<span style={{fontSize:10,fontWeight:400}}>/{total}</span></span>
                <div style={{width:100,height:6,background:"#ededed",display:"inline-block",verticalAlign:"middle"}}><div style={{width:`${total?(done/total)*100:0}%`,height:"100%",background:done===total&&total>0?"#43A047":"#F75555",transition:"width 0.3s"}}/></div></div>
              <div onClick={e=>e.stopPropagation()} style={{padding:"2px 10px",borderRadius:13,background:"#FAFAFA",fontSize:12,color:"#006EC3",fontWeight:600,cursor:"pointer"}}>+ Add Task</div></div>
            {isOpen&&(<div style={{background:"#fff",border:"1px solid #F7F7F7"}}>
              <div style={{display:"grid",gridTemplateColumns:"44px 1fr 130px 140px 40px",background:"#d5d5d5",borderBottom:"1px solid #E8E8E8"}}>
                <div style={{padding:"8px",fontSize:10,color:"#666"}}>S.N.</div><div style={{padding:"8px",fontSize:10,color:"#666"}}>Task Name</div>
                <div style={{padding:"8px",fontSize:10,color:"#666"}}>Status</div><div style={{padding:"8px",fontSize:10,color:"#666"}}>Assignee</div><div/></div>
              {msTasks.map((t,idx)=>{const st=getStatus(t.id);const stObj=STATUS_OPTS.find(s=>s.v===st)||STATUS_OPTS[0];
                return(<div key={t.id} style={{display:"grid",gridTemplateColumns:"44px 1fr 130px 140px 40px",borderBottom:"1px solid #f0f0f0",alignItems:"start",minHeight:62}}>
                  <div style={{padding:"14px 8px",fontSize:13,color:"#888",textAlign:"right"}}>{idx+1}</div>
                  <div style={{padding:"10px 8px",cursor:"pointer"}} onClick={()=>setOpenTask(t.id)}>
                    {t.approved&&<div style={{fontSize:8,fontWeight:600,color:"#46B774",lineHeight:"1"}}>Approved</div>}
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:14,color:"#006EC3",textDecoration:"underline"}}>{t.name}</span>
                      {t.isNew&&<span style={{fontSize:9,background:"#FFF3E0",color:"#E65100",padding:"1px 5px",borderRadius:3,fontWeight:600}}>NEW</span>}
                      <span style={{fontSize:9,background:"#f0f0f0",color:"#888",padding:"1px 4px",borderRadius:2}}>{t.code}</span></div>
                    <div style={{color:"red",fontStyle:"italic",fontSize:10,marginTop:1}}>Deadline: 20 Jan 2026</div></div>
                  <div style={{padding:"10px 4px"}} onClick={e=>e.stopPropagation()}>
                    <select value={st} onChange={e=>setStatuses({...statuses,[t.id]:e.target.value})}
                      style={{width:108,height:28,border:"none",borderRadius:4,padding:"0 6px",fontSize:12,fontWeight:600,background:stObj.bg,color:stObj.c,cursor:"pointer",outline:"none"}}>
                      {STATUS_OPTS.map(s=><option key={s.v} value={s.v}>{s.v}</option>)}</select>
                    <div style={{fontSize:10,color:"#333",marginTop:4}}>a few seconds ago</div></div>
                  <div style={{padding:"10px 8px"}}><div style={{fontSize:12,fontWeight:600,color:"#111"}}>{t.team||"—"}</div><div style={{fontSize:10,color:"#333"}}>{t.assignee}</div></div>
                  <div style={{padding:"14px 8px",textAlign:"center"}}><span style={{fontSize:16,color:"#333",cursor:"pointer"}} title="Watcher">👁‍🗨</span></div>
                </div>)})}</div>)}</div>)})}</div>
      <div style={{padding:"12px 16px",borderTop:"1px solid #eee",background:"#fafafa",display:"flex",justifyContent:"space-between",fontSize:12,color:"#888"}}>
        <span>Showing {personaTasks.length} tasks for {personas.find(p=>p.id===activePersona)?.label}</span>
        <span>{milestones.filter(m=>(grouped[m]||[]).length>0).length} milestones</span></div></div></div>);
}
