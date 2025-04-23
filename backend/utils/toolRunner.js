import path from 'path';

export async function runToolByName(name, params) {
    const toolPath = path.join(process.cwd(), 'LLM', 'assessment', 'tools', `${name}.js`);
    const tool = (await import(`file://${toolPath}`)).default;

    if (typeof tool !== 'function') {
        throw new Error(`Tool "${name}" is not a valid function`);
    }

    return await tool(params);
}
