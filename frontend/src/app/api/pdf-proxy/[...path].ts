// pages/api/pdf-proxy/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path: pathSegments } = req.query;
  
  if (!pathSegments || !Array.isArray(pathSegments)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  
  const filePath = path.join(
    process.cwd(),
    'node_modules',
    'pdfjs-dist',
    'cmaps',
    ...pathSegments
  );
  
  try {
    const fileContent = fs.readFileSync(filePath);
    
    // Set appropriate content type
    if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (filePath.endsWith('.bcmap')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    } else {
      res.setHeader('Content-Type', 'text/plain');
    }
    
    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Error serving PDF resource:', error);
    res.status(404).json({ error: 'Resource not found' });
  }
}