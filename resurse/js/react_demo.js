class Slider extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return [React.createElement("p", {className: "slider mb-1"}, this.props.nume + " : " + this.props.val),
            React.createElement("button", {onClick: this.props.oninc}, "+"),
            React.createElement("button", {onClick: this.props.ondec, className: "mb-2"}, "-")]
    }
}

class Root extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            field_1: 1,
            field_2: 1,
            field_3: 1,
        };
        this.increase_f1 = this.increase_f1.bind(this);
        this.increase_f2 = this.increase_f2.bind(this);
        this.increase_f3 = this.increase_f3.bind(this);
        this.decrease_f1 = this.decrease_f1.bind(this);
        this.decrease_f2 = this.decrease_f2.bind(this);
        this.decrease_f3 = this.decrease_f3.bind(this);
        this.trimite = this.trimite.bind(this);
    }

    increase_f1() {
        if(this.state.field_1 < 5) {
            this.setState(state => ({
                field_1: state.field_1 + 1
            }))
        }
    }

    increase_f2() {
        if(this.state.field_2 < 5) {
            this.setState(state => ({
                field_2: state.field_2 + 1
            }))
        }
    }

    increase_f3() {
        if(this.state.field_3 < 5) {
            this.setState(state => ({
                field_3: state.field_3 + 1
            }))
        }
    }

    decrease_f1() {
        if(this.state.field_1 > 1) {
            this.setState(state => ({
                field_1: state.field_1 - 1
            }))
        }
    }

    decrease_f2() {
        if(this.state.field_2 > 1) {
            this.setState(state => ({
                field_2: state.field_2 - 1
            }))
        }
    }

    decrease_f3() {
        if(this.state.field_3 > 1) {
            this.setState(state => ({
                field_3: state.field_3 - 1
            }))
        }
    }

    trimite() {
        this.setState({
            field_1: 1,
            field_2: 1,
            field_3: 1,
        })
    }

    render() {
        return [React.createElement("p", null, `Va rugam sa ne trimiteti un feedback, intre 1 si 5`),
            React.createElement(Slider, {nume: "Diversitate produse", val: this.state.field_1, oninc: this.increase_f1, ondec: this.decrease_f1}),
            React.createElement(Slider, {nume: "Personal contact", val: this.state.field_2, oninc: this.increase_f2, ondec: this.decrease_f2}),
            React.createElement(Slider, {nume: "Preturi competitive", val: this.state.field_3, oninc: this.increase_f3, ondec: this.decrease_f3}),
            React.createElement("br", null),
            React.createElement("button", {onClick: this.trimite, className: "mt-2"}, "Trimite")]
    }
}

window.addEventListener("load", function () {
    let radReact2 = ReactDOM.createRoot(document.getElementById("react"));
    radReact2.render(React.createElement(Root,));
});