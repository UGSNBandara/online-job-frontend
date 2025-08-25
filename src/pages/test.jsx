import React from "react";
import { useState, useEffect, useMemo } from "react";


const testColor = () => {
    const [color, setColor] = useState('red');
    const [count, setCount] = useState(0);

    const changeColor = () => {
        setColor('blue');
        if (color == 'blue'){
            setColor('red');
        }
    };

    useEffect(() => {
        setCount(count+1);
    }, []);

    const result = useMemo(() => {
        console.log("Calculation started");
        let sum = 0;
        for (let i =0; i< 1000; i++){
            sum +=1;
        }
        console.log("Calculation completed");

        return sum;
    }, []);


    return(

        <div>
            <h1>Hello color is {color}</h1>
            <h1>Count changed the color : {count}</h1>
            <button onClick={changeColor}> Change the color</button>
        </div>
    );


};

export default testColor;