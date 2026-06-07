'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

interface Node {
  id: string
  label: string
  type: 'topic' | 'entity'
}

interface Link {
  source: string
  target: string
  relation: string
}

interface ConceptGraphData {
  nodes: Node[]
  links: Link[]
}

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-slate-100 rounded-lg">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-600">Loading visualization...</p>
      </div>
    </div>
  ),
})

interface ConceptGraphVisualizerProps {
  data: ConceptGraphData | null
  loading?: boolean
}

export default function ConceptGraphVisualizer({ data, loading }: ConceptGraphVisualizerProps) {
  const graphData = useMemo(() => {
    if (!data) return { nodes: [], links: [] }

    return {
      nodes: data.nodes.map((node) => ({
        ...node,
        color: node.type === 'topic' ? '#3b82f6' : '#8b5cf6',
        size: 8,
      })),
      links: data.links.map((link) => ({
        ...link,
        value: 1,
      })),
    }
  }, [data])

  if (loading || !data) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-slate-100 rounded-lg border border-slate-300">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-600">Analyzing concepts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl border border-slate-200 overflow-hidden shadow-lg bg-white">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Concept Network Visualization</h3>
        <p className="text-sm text-slate-600 mt-1">
          {graphData.nodes.length} concepts, {graphData.links.length} relationships
        </p>
      </div>
      {(ForceGraph2D as any) && (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel={(node: any) => `${node.label} (${node.type})`}
          nodeColor={(node: any) => node.color}
          nodeVal={(node: any) => node.size * 3}
          linkColor={() => '#cbd5e1'}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.2}
          linkWidth={1.5}
          linkDistance={500}
          nodeRepulsion={-2000}
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.3}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.label
            const fontSize = 10 / globalScale
            ctx.font = `${fontSize}px Sans-Serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            // Draw node
            ctx.fillStyle = node.color
            ctx.beginPath()
            ctx.arc(node.x, node.y, node.size * 1.5, 0, 2 * Math.PI)
            ctx.fill()

            // Draw border
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 2 / globalScale
            ctx.beginPath()
            ctx.arc(node.x, node.y, node.size * 1.5, 0, 2 * Math.PI)
            ctx.stroke()

            // Draw label on node
            ctx.fillStyle = '#fff'
            // Truncate long labels to fit on node
            const maxLength = 15
            const displayLabel = label.length > maxLength ? label.substring(0, maxLength) + '...' : label
            ctx.fillText(displayLabel, node.x, node.y)
          }}
          linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const start = link.source
            const end = link.target

            // Draw the line
            ctx.strokeStyle = '#cbd5e1'
            ctx.lineWidth = 2 / globalScale
            ctx.beginPath()
            ctx.moveTo(start.x, start.y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()

            // Draw arrow head
            const angle = Math.atan2(end.y - start.y, end.x - start.x)
            const arrowSize = 8
            ctx.fillStyle = '#cbd5e1'
            ctx.beginPath()
            ctx.moveTo(end.x, end.y)
            ctx.lineTo(end.x - arrowSize * Math.cos(angle - Math.PI / 6), end.y - arrowSize * Math.sin(angle - Math.PI / 6))
            ctx.lineTo(end.x - arrowSize * Math.cos(angle + Math.PI / 6), end.y - arrowSize * Math.sin(angle + Math.PI / 6))
            ctx.closePath()
            ctx.fill()

            // Draw text label
            const textPos = {
              x: (start.x + end.x) / 2,
              y: (start.y + end.y) / 2,
            }

            const relText = link.relation
            const fontSize = 10 / globalScale
            ctx.font = `${fontSize}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            
            // Background for text
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
            const textWidth = ctx.measureText(relText).width
            const textHeight = fontSize * 1.5
            ctx.fillRect(
              textPos.x - textWidth / 2 - 5,
              textPos.y - textHeight / 2 - 3,
              textWidth + 10,
              textHeight + 6
            )
            
            // Text
            ctx.fillStyle = '#1e293b'
            ctx.fillText(relText, textPos.x, textPos.y)
          }}
          onNodeHover={(node: any) => {
            // Node hover effect can be added here
          }}
          warmupTicks={100}
          cooldownTime={3000}
          height={800}
        />
      )}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
        <p>💡 Hover over nodes to see details. Drag to move. Scroll to zoom.</p>
      </div>
    </div>
  )
}
