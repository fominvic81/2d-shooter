

export const createInterfaceHandler = () => {
    return {
        elements: [],

        update (dt, touches) {
            for (const element of this.elements) {
                element.update(dt, touches);
            }
        },

        render (ctx) {
            for (const element of this.elements) {
                element.render(ctx);
            }
        },

        addElement (element) {
            this.elements.push(element);
        },
    }
}