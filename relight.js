(function (window, document) {
    var containerExpressions = /^<([^>]+)>(.*)/ig,
        componentsMap = {},
        nextComponentId=1,
        renderDOM = (componentClass,props={})=> {
            if(!componentClass.prototype) throw new Error("is not a class");
            var componentId = `comp-${nextComponentId++}`,
                component = new componentClass({props, componentId }),
                result = component.render();

            componentsMap[componentId] = component;

            result = result.replace(containerExpressions, `<\$1 key="${componentId}">$2`);
            return result;
        };

    var getComponentElem = componentId => document.querySelector(`[key=${componentId}]`);
    var getComponentElemChildren = element => element.querySelectorAll(`[key^="comp-"]`);
    var getComponentParentElems = (componentElement,getFirst=false) => {
        var parentComponents = [];
        while(componentElement && componentElement.parentNode) {
            componentElement = componentElement.parentNode;

            var componentId = componentElement && componentElement.nodeType != 9 && componentElement.getAttribute('key');
            if(typeof componentId == "string" && componentId.startsWith('comp-')) parentComponents.push(componentElement);
            if(getFirst && parentComponents.length == 1) return parentComponents[0];
        }

        return parentComponents;
    };

    var getComponentByElem = element => {
        var componentId = componentElement && componentElement.nodeType != 9 && componentElement.getAttribute('key');
        if(typeof componentId == "string" && componentId.startsWith('comp-')) return componentsMap[componentId];
    };

    var destroyComponents = element => {
        var i, componentElems = getComponentElemChildren(element);

        for(i=0; i< componentElems.length; i++) {
            var componentId = componentElems[i].getAttribute('key');
            componentsMap[componentId].destroy && componentsMap[componentId].destroy();
            componentElems[i].remove();
            delete componentsMap[componentId];
        }
    };

    window.relight = {
        renderDOM,
        getComponentElem,
        getComponentElemChildren,
        getComponentParentElems,
        destroyComponents,
        getComponentByElem
    };
})(window, document);
