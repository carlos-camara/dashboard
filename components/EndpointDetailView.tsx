
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Endpoint } from '../types';
import {
    ChevronLeft, Globe, Activity, Clock, Server, FileJson,
    CheckCircle2, AlertCircle, Upload, Code, Brackets,
    FileText, Database, Lock, Key, Hash, Type, List,
    Box, ChevronRight, ChevronDown, ShieldCheck, Play,
    AlertTriangle, Layers, Eye
} from 'lucide-react';

interface EndpointDetailViewProps {
    endpoint: Endpoint;
    onBack: () => void;
}

// --- SUBMIT COMPONENTS ---

const TypeBadge: React.FC<{ type: string, format?: string }> = ({ type, format }) => {
    let color = 'text-slate-400 border-slate-700 bg-slate-900';
    let Icon = Box;

    switch (type) {
        case 'string': color = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'; Icon = Type; break;
        case 'integer':
        case 'number': color = 'text-blue-400 border-blue-500/30 bg-blue-500/10'; Icon = Hash; break;
        case 'boolean': color = 'text-amber-400 border-amber-500/30 bg-amber-500/10'; Icon = Activity; break;
        case 'array': color = 'text-violet-400 border-violet-500/30 bg-violet-500/10'; Icon = List; break;
        case 'object': color = 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'; Icon = Brackets; break;
    }

    return (
        <span className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${color}`}>
            <Icon size={10} />
            <span>{format || type}</span>
        </span>
    );
};

const ValidationBadge: React.FC<{ label: string, color?: string }> = ({ label, color = "text-slate-500 border-slate-700" }) => (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${color}`}>
        {label}
    </span>
);

const ExampleViewer: React.FC<{ examples: Record<string, any> }> = ({ examples }) => {
    const [selected, setSelected] = useState(Object.keys(examples)[0]);

    if (!examples || Object.keys(examples).length === 0) return null;

    return (
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden mt-4">
            <div className="flex border-b border-slate-800 overflow-x-auto">
                {Object.entries(examples).map(([key, ex]: [string, any]) => (
                    <button
                        key={key}
                        onClick={() => setSelected(key)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase border-r border-slate-800 transition-colors ${selected === key ? 'bg-slate-900 text-indigo-400' : 'text-slate-500 hover:text-white hover:bg-slate-900/50'}`}
                    >
                        {ex.summary || key}
                    </button>
                ))}
            </div>
            <div className="p-4 bg-slate-950/80 overflow-x-auto max-h-64 custom-scrollbar relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(examples[selected].value, null, 2))}
                    >
                        <Code size={14} />
                    </button>
                </div>
                <pre className="text-xs font-mono text-slate-400 leading-relaxed">
                    {JSON.stringify(examples[selected].value, null, 2)}
                </pre>
            </div>
        </div>
    );
};

const SchemaNode: React.FC<{ name?: string, schema: any, required?: boolean, depth?: number }> = ({ name, schema, required, depth = 0 }) => {
    const [expanded, setExpanded] = useState(true);

    // Dereference or handle simple mapping (in a real app we'd resolve $ref properly)
    // For now we assume the schema is already resolved or simple

    // Handle Array types wrapping objects
    const actualSchema = schema.type === 'array' ? schema.items : schema;
    const isArray = schema.type === 'array';
    const hasChildren = schema.properties || (schema.type === 'array' && schema.items?.properties) || schema.oneOf || schema.anyOf;

    // Check strictness constraints
    const validations = [];
    if (schema.minLength) validations.push(`Min Len: ${schema.minLength}`);
    if (schema.maxLength) validations.push(`Max Len: ${schema.maxLength}`);
    if (schema.minItems) validations.push(`Min Items: ${schema.minItems}`);
    if (schema.pattern) validations.push(`Pattern: /.../`);

    return (
        <div className={`font-mono text-sm ${depth > 0 ? 'ml-4 border-l border-slate-800 pl-4' : ''}`}>
            <div className={`flex items-start py-1.5 group rounded px-2 -ml-2 transition-all ${depth === 0 ? 'bg-slate-900/40 border border-slate-800/50 mb-2' : 'hover:bg-white/5'}`}>
                {hasChildren ? (
                    <button onClick={() => setExpanded(!expanded)} className="mt-1 mr-2 text-slate-500 hover:text-indigo-400 transition-colors">
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                ) : <div className="w-5 mr-1"></div>}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                        {name && <span className="text-slate-200 font-bold">{name}</span>}
                        {required && <ValidationBadge label="Required" color="text-rose-400 border-rose-500/30 bg-rose-500/10" />}
                        {isArray && <ValidationBadge label="Array []" color="text-violet-400 border-violet-500/30 bg-violet-500/10" />}

                        {/* OneOf / AnyOf Indicators */}
                        {schema.oneOf && <ValidationBadge label="One Of Choice" color="text-amber-400 border-amber-500/30 bg-amber-500/10" />}

                        <TypeBadge type={actualSchema?.type || 'object'} format={actualSchema?.format} />

                        {validations.map(v => <span key={v} className="text-[9px] text-slate-500 bg-slate-900 px-1 rounded border border-slate-800">{v}</span>)}
                    </div>

                    {schema.description && (
                        <div className="flex items-start mt-1 space-x-2">
                            <div className="w-0.5 h-full bg-slate-800"></div>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-2xl">{schema.description}</p>
                        </div>
                    )}

                    {/* Enum values */}
                    {schema.enum && (
                        <div className="flex gap-1 flex-wrap mt-1">
                            {schema.enum.map((v: string) => (
                                <span key={v} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] border border-amber-500/20 font-bold">"{v}"</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {hasChildren && expanded && (
                <div className="mt-1 space-y-1">
                    {actualSchema.properties && Object.entries(actualSchema.properties).map(([key, prop]: [string, any]) => (
                        <SchemaNode
                            key={key}
                            name={key}
                            schema={prop}
                            required={actualSchema.required?.includes(key)}
                            depth={depth + 1}
                        />
                    ))}

                    {/* Handling oneOf scenarios simply by listing options if possible, or visually indicating branching */}
                    {(schema.oneOf || schema.anyOf)?.map((opt: any, i: number) => (
                        <div key={i} className="ml-4 pl-4 border-l-2 border-dashed border-slate-800 my-2 relative">
                            <span className="absolute -left-3 top-2 bg-slate-900 text-[9px] text-slate-500 px-1">Option {i + 1}</span>
                            <SchemaNode schema={opt} depth={depth} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- MAIN WRAPPER ---

// --- MAIN WRAPPER ---

const EndpointDetailView: React.FC<EndpointDetailViewProps> = ({ endpoint, onBack }) => {
    const [spec, setSpec] = useState<any>(null);
    const [loadingSpec, setLoadingSpec] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [viewMode, setViewMode] = useState<'schema' | 'example'>('schema');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch linked swagger spec - NOW USING PROJECT-LEVEL SPEC
    useEffect(() => {
        // First try to get project-level spec (e.g., dashboard.yaml)
        api.getProjectSpec(endpoint.service).then(res => {
            if (res.found) {
                setSpec(res.content);
            } else {
                // Fallback to individual endpoint spec
                api.getSpec(endpoint.method, endpoint.path).then(fallbackRes => {
                    if (fallbackRes.found) {
                        setSpec(fallbackRes.content);
                    }
                    setLoadingSpec(false);
                });
                return;
            }
            setLoadingSpec(false);
        });
    }, [endpoint]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const file = e.target.files[0];
        const success = await api.uploadSpec(endpoint.method, endpoint.path, file);

        if (success) {
            const res = await api.getSpec(endpoint.method, endpoint.path);
            if (res.found) setSpec(res.content);
        } else {
            alert("Failed to upload spec file.");
        }

        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const successRate = (endpoint.passCount / (Math.max(1, endpoint.passCount + endpoint.failCount))) * 100;

    // Helper to extract the operation object from a full OpenAPI doc or fragment
    const getOperationObject = (fullSpec: any) => {
        if (!fullSpec) return null;

        // Case A: It's a full document with 'paths'
        if (fullSpec.paths) {
            // Try exact match
            let pathItem = fullSpec.paths[endpoint.path];

            // Try normalized match (if swagger has /api/users/{id} but endpoint is /api/users/123)
            // specific logic: simple regex or just look for keys
            if (!pathItem) {
                const keys = Object.keys(fullSpec.paths);
                // simple fallback: find first path that starts with correct prefix or if only 1 exists
                if (keys.length === 1) pathItem = fullSpec.paths[keys[0]];
                else {
                    const potential = keys.find(k => endpoint.path.endsWith(k) || k.includes(endpoint.path));
                    if (potential) pathItem = fullSpec.paths[potential];
                }
            }

            if (pathItem) {
                return pathItem[endpoint.method.toLowerCase()] || pathItem[endpoint.method.toUpperCase()];
            }
        }

        // Case B: It's already an operation fragment
        if (fullSpec.requestBody || fullSpec.responses || fullSpec.operationId) {
            return fullSpec;
        }

        return null; // Could not resolve operation
    };

    const operation = getOperationObject(spec);

    // Resolve helper for simple definitions
    const resolveSchema = (refOrSchema: any) => {
        if (refOrSchema?.$ref) {
            const refName = refOrSchema.$ref.split('/').pop();
            // Look in root spec components
            if (spec?.components?.schemas?.[refName]) return spec.components.schemas[refName];
            // Fallback: look in definitions (Swagger 2.0)
            if (spec?.definitions?.[refName]) return spec.definitions[refName];
        }
        return refOrSchema;
    };

    // Pre-process request body to resolve top-level Ref
    const requestBodyContent = operation?.requestBody?.content?.['application/json'];
    const requestSchema = requestBodyContent ? resolveSchema(requestBodyContent.schema) : null;
    const requestExamples = requestBodyContent?.examples || {};

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-24">
            {/* Header / Nav */}
            <div className="flex justify-between items-start">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-400 hover:text-white transition-all group px-4 py-2 hover:bg-slate-800 rounded-full w-fit"
                >
                    <ChevronLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Back to Catalog</span>
                </button>
            </div>

            {/* Hero Card */}
            <div className={`relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 border shadow-2xl backdrop-blur-xl ${endpoint.method === 'POST' ? 'bg-orange-500/5 border-orange-500/20' :
                endpoint.method === 'GET' ? 'bg-blue-500/5 border-blue-500/20' :
                    'bg-slate-900/60 border-slate-800/60'
                }`}>

                <div className={`absolute top-0 right-0 w-96 h-96 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none opacity-20 ${endpoint.method === 'POST' ? 'bg-orange-500' :
                    endpoint.method === 'GET' ? 'bg-blue-500' : 'bg-slate-500'
                    }`}></div>

                <div className="relative flex flex-col md:flex-row justify-between gap-8">
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center space-x-4">
                            <div className={`px-4 py-3 rounded-2xl font-black text-xl shadow-lg ${endpoint.method === 'POST' ? 'bg-orange-500 text-white shadow-orange-500/20' :
                                endpoint.method === 'GET' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                                    endpoint.method === 'DELETE' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                                        'bg-slate-700 text-slate-300'
                                }`}>
                                {endpoint.method}
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span className="flex items-center px-3 py-1 bg-slate-950/50 rounded-lg border border-slate-800"><Globe size={12} className="mr-1.5" /> {endpoint.service}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-white font-mono break-all leading-tight tracking-tight">
                            {endpoint.path}
                        </h1>

                        <div className="flex items-center gap-4">
                            {(operation?.security || spec?.security) ? (
                                <div className="flex items-center text-emerald-400 text-xs font-bold px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <ShieldCheck size={14} className="mr-1.5" /> Secured Endpoint
                                </div>
                            ) : (
                                <div className="flex items-center text-slate-500 text-xs font-bold px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full">
                                    <Lock size={14} className="mr-1.5" /> Public Access
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 min-w-[300px]">
                        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                                <Activity size={18} className="text-emerald-500" />
                                <span className={`text-2xl font-black ${successRate >= 90 ? 'text-emerald-500' : 'text-rose-500'}`}>{successRate.toFixed(0)}%</span>
                            </div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Success Rate</p>
                        </div>

                        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                                <Clock size={18} className="text-amber-500" />
                                <span className="text-2xl font-black text-white">{endpoint.avgDuration.toFixed(0)}<span className="text-sm text-slate-500 ml-1">ms</span></span>
                            </div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Avg Latency</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Spec */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Validation Summary if any */}
                    {requestSchema && requestSchema.required && (
                        <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 flex items-start space-x-4">
                            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                            <div>
                                <h4 className="text-rose-400 text-xs font-black uppercase tracking-widest mb-1">Strict Validation Rules</h4>
                                <p className="text-rose-200/60 text-xs mb-2">This endpoint blocks requests missing these fields:</p>
                                <div className="flex flex-wrap gap-2">
                                    {requestSchema.required.map((f: string) => (
                                        <span key={f} className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-1 rounded border border-rose-500/30">{f}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {loadingSpec ? (
                        <div className="h-64 rounded-3xl bg-slate-900/30 border border-slate-800 flex items-center justify-center animate-pulse">
                            <div className="text-center">
                                <Database size={32} className="mx-auto mb-4 text-slate-700" />
                                <p className="text-slate-600 font-bold uppercase text-xs tracking-widest">Hydrating Schemas...</p>
                            </div>
                        </div>
                    ) : spec ? (
                        <div className="space-y-8">

                            {/* Request Body - The Cool Schema Tree */}
                            {requestSchema && (
                                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                        <Box size={120} className="text-indigo-500" />
                                    </div>

                                    <div className="flex items-center justify-between mb-6">
                                        <h5 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center">
                                            <Brackets size={16} className="mr-2" /> Request Payload
                                        </h5>

                                        {Object.keys(requestExamples).length > 0 && (
                                            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                                                <button
                                                    onClick={() => setViewMode('schema')}
                                                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${viewMode === 'schema' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    Schema
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('example')}
                                                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${viewMode === 'example' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    Examples
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {viewMode === 'schema' ? (
                                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                                            <div className="text-[10px] text-slate-500 mb-4 font-mono">// Structure definition</div>
                                            <SchemaNode schema={requestSchema} />
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <ExampleViewer examples={requestExamples} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Responses */}
                            {operation?.responses && (
                                <div className="space-y-4">
                                    <h5 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center">
                                        <Code size={16} className="mr-2" /> Response Scenarios
                                    </h5>
                                    {Object.entries(operation.responses).map(([code, response]: [string, any]) => {
                                        const respContent = response.content?.['application/json'];
                                        const respSchema = respContent && resolveSchema(respContent.schema);
                                        const respExample = respContent?.example || (respContent?.examples ? (Object.values(respContent.examples)[0] as any)?.value : null);

                                        return (
                                            <div key={code} className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group hover:border-slate-700 transition-colors">
                                                <div className={`px-6 py-4 border-b border-slate-800/50 flex items-center justify-between ${code.startsWith('2') ? 'bg-emerald-500/5' : code.startsWith('4') || code.startsWith('5') ? 'bg-rose-500/5' : 'bg-slate-800/20'}`}>
                                                    <div className="flex items-center space-x-4">
                                                        <span className={`text-xl font-mono font-black ${code.startsWith('2') ? 'text-emerald-500' : 'text-rose-500'}`}>{code}</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-slate-300 font-bold">{response.description}</span>
                                                            {respSchema && <span className="text-[10px] text-slate-500 font-mono mt-0.5">Returns: {respSchema.type || 'Object'}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {(respSchema || respExample) && (
                                                    <div className="p-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/50">
                                                        {respSchema && (
                                                            <div className="p-6">
                                                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Schema Structure</div>
                                                                <SchemaNode schema={respSchema} />
                                                            </div>
                                                        )}
                                                        {respExample && (
                                                            <div className="p-6 bg-black/20">
                                                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Example Payload</div>
                                                                <pre className="text-[10px] font-mono text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-auto">
                                                                    {JSON.stringify(respExample, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="h-64 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20 flex flex-col items-center justify-center text-slate-600 space-y-4 group hover:border-slate-700 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <FileJson size={48} className="opacity-50 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-bold uppercase tracking-wide">No Schema Definition</p>
                            <p className="text-xs text-slate-500 max-w-xs text-center">Click here to upload a Swagger/OpenAPI JSON file to unlock the schema explorer.</p>
                        </div>
                    )}
                </div>

                {/* Right: Security & Meta */}
                <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Authentication</h4>
                            {(operation?.security || spec?.security) && <ShieldCheck size={14} className="text-emerald-500" />}
                        </div>
                        {(operation?.security || spec?.security) ? (
                            <div className="space-y-2">
                                {(operation?.security || spec?.security).map((sec: any, i: number) => (
                                    <div key={i} className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 text-xs shadow-lg shadow-emerald-500/5">
                                        <div className="flex items-center text-emerald-400 font-bold mb-1">
                                            <Key size={14} className="mr-2" />
                                            {Object.keys(sec)[0]}
                                        </div>
                                        <p className="text-emerald-500/60 text-[10px] leading-relaxed">Required for all requests.</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center text-slate-400 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <Lock size={14} className="mr-2 opacity-50" /> No authentication specified
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Live Discovery Data</h4>
                        <div className="space-y-4 font-mono text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Service</span>
                                <span className="text-white bg-slate-800 px-2 py-0.5 rounded text-[10px]">{endpoint.service}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Method</span>
                                <span className="text-white bg-slate-800 px-2 py-0.5 rounded text-[10px]">{endpoint.method}</span>
                            </div>
                            <div className="w-full h-px bg-slate-800"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Health</span>
                                <div className={`flex items-center space-x-1.5 px-2 py-1 rounded border ${endpoint.failCount === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                    <Activity size={10} />
                                    <span className="font-bold">{endpoint.failCount === 0 ? 'Stable' : 'Degraded'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="spec-upload" />
                        <label htmlFor="spec-upload" className={`w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-2xl text-[10px] font-black uppercase cursor-pointer border-2 border-dashed transition-all ${isUploading ? 'bg-indigo-600 border-indigo-500 text-white opacity-50' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-white hover:border-indigo-500 hover:bg-slate-900'}`}>
                            <Upload size={16} className={isUploading ? 'animate-bounce' : ''} />
                            <span>{spec ? 'Update Definition' : 'Upload Definition'}</span>
                        </label>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EndpointDetailView;
