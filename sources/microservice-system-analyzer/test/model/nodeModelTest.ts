import { describe, it, test } from 'mocha'
import { expect } from 'chai'

import { Node, Edge } from '~/model/nodeModel'
import { RawNode, RawEdge, RawModelConverter } from '~/model/rawNodeModel'

/* tslint:disable:no-unused-expression */
describe('node model', function() {

  test('basic operations', function() {
    const emptySystem = new Node('system')
    expect(emptySystem.hasNodes()).to.be.false
    expect(emptySystem.hasEdges()).to.be.false

    const system: Node = RawModelConverter.convertToNode({
      id: 'system',
      nodes: [
        { id: 'A' },
        { id: 'B' }
      ],
      edges: [
        { sourceId: 'A', targetId: 'B' }
      ]
    })

    expect(system.getNodes().length).to.equal(2)
    expect(system.hasNodes()).to.be.true
    expect(system.findNode('A')).to.deep.equal(new Node('A'))

    expect(system.getEdges().length).to.equal(1)
    expect(system.hasEdges()).to.be.true
    expect(system.findEdge('A', 'B')).to.deep.equal(new Edge('A', 'B'))
  })

  test('props are always accessible', function() {
    const node = new Node('system')

    expect(node.props).not.to.be.undefined
    expect(node.props.x).to.be.undefined

    node.props.x = 'x'
    expect(node.props.x).to.equal('x')
  })
})