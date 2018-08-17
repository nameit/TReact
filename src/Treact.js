/**
 * 复合组件
 * 使元组件和复合组件处理方式相同
 * @param {*} props 
 */
const TopLevelWrapper = function (props) {
    this.props = props
}

TopLevelWrapper.prototype.render = function () {
    return this.props
}

/**
 * 
 * @param {*} element 
 */
function instantiateTReactComponent(element) {
    if (typeof element.type === 'string') {
        return new TReactDOMComponent(element)
    } else if(typeof element.type === 'function') { // 递归
        return new TReactCompositeComponentWrapper(element)
    }
}

/**
 * @function mountComponent
 */
const TReactReconciler = {
    mountComponent(internalInstance, container) {
        return internalInstance.mountComponent(container)
    }
}

/**
 * 创建一个简单的dom元素
 * 插入装载
 * @function mountComponent
 */
class TReactDOMComponent {
    constructor(element) {
        this._currentElement = element
    }

    mountComponent(container) {
        const domElement = document.createElement(this._currentElement.type)
        const text = this._currentElement.props.children
        const textNode = document.createTextNode(text)
        
        domElement.appendChild(textNode)
        container.appendChild(domElement)

        this._hostNode = domElement
        return domElement
    }
}

/**
 * 兼容处理
 * 复合组件 dom元素 等区分
 * @function mountComponent
 */
class TReactCompositeComponentWrapper {
    constructor (element) {
        this._currentElement = element
    }

    performInitialMount (container) { // 分层
        const renderedElement = this._instance.render()
        const child = instantiateTReactComponent(renderedElement) // 递归
        this._renderedComponent = child
        return TReactReconciler.mountComponent(child, container)
    }

    mountComponent (container) {
        const Component = this._currentElement.type
        const componentInstance = new Component(this._currentElement.props)
        this._instance = componentInstance

        const markup = this.performInitialMount(container)
        return markup
    }
}

/**
 * @function createElement 创建dom元素
 * @function createClass 创建复合组件
 */
const TReact = {
    createElement(type, props, children) {
        const element = {
            type,
            props: props || {}
        }
        if (children) {
            element.props.children = children
        }
        return element
    },

    createClass(spec) {
        function Constructor(props) {
            this.props = props
        }
        Constructor.prototype = Object.assign(Constructor.prototype, spec) // 加入render
        return Constructor
    },

    render(element, container) {
        const wrapperElement = this.createElement(TopLevelWrapper, element)
        const componentInstance = new TReactCompositeComponentWrapper(wrapperElement)
        return componentInstance.mountComponent(container)
    }
}

const MyTitle = TReact.createClass({
    render() {
        return TReact.createElement('h1', null, this.props.message)
    }
})

// const mount = TReact.createElement('h1', null, 'hello world')
// const root = document.getElementById('root')

// TReact.render(
//     mount,
//     root
// )

const mount = TReact.createElement(MyTitle, { message: 'hey there TReact' })
const root = document.getElementById('root')

TReact.render(
    mount,
    root
)
