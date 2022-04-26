import React, { useRef, useState } from 'react';
import { Icon } from '../FontIcon';

interface TempProps {
    label: Array<{
        name: string;
        onChange: (val: string) => void;
        placeholder?: string;
        max?: number;
        min?: number;
        step?: number;
        defaultValue?: string | number;
        onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    }>;
}

const Temp: React.FC<TempProps> = ({ label }) => {
    const ref = useRef<Record<string, HTMLInputElement | null>>({});

    const [hover, setHover] = useState<false | string>(false);
    const [focus, setFocus] = useState<false | string>(false);

    const pre = useRef({
        x: 0,
        y: 0,
    });

    const arr = label.map((item) => {
        return (
            <div key={item.name}>
                <div className="position_name">{item.name}</div>
                <div
                    className="position_iptContainer"
                    onMouseOver={() => setHover(item.name)}
                    onMouseLeave={() => setHover(false)}
                >
                    <input
                        type="number"
                        className="position_ipt"
                        onChange={(e) => {
                            let val = Number(e.currentTarget.value);
                            if (item.max && val > item.max) {
                                e.currentTarget.value = pre.current.y.toString();
                                val = pre.current.y;
                            } else if (item.min && val < item.min) {
                                e.currentTarget.value = pre.current.y.toString();
                                val = pre.current.y;
                            } else {
                                pre.current.y = Number(e.currentTarget.value);
                            }

                            item.onChange(val.toString() || '0');
                        }}
                        placeholder={item.placeholder}
                        max={item.max}
                        min={item.min}
                        step={item.step}
                        onFocus={() => setFocus(item.name)}
                        onBlur={() => setFocus(false)}
                        defaultValue={item.defaultValue}
                        onKeyDown={item.onKeyDown}
                        ref={(el) => {
                            ref.current[item.name] = el;
                        }}
                    />
                    {(hover === item.name || focus === item.name) && (
                        <div className="stepContainer">
                            <Icon
                                type="dropdown"
                                className="upIcon"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const el = ref.current[item.name];
                                    if (el) {
                                        const val = Number(el.value) - (item.step || 1);
                                        if (item.min && val < item.min) {
                                            return;
                                        }
                                        el.value = val.toString();
                                        item.onChange(val.toString() || '0');
                                    }
                                }}
                            />
                            <Icon
                                type="dropdown"
                                className="downIcon"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const el = ref.current[item.name];
                                    if (el) {
                                        const val = Number(el.value) + (item.step || 1);
                                        if (item.max && val > item.max) {
                                            return;
                                        }
                                        el.value = val.toString();
                                        item.onChange(val.toString() || '0');
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    });

    return <div className="ipt_container">{arr}</div>;
};
export default Temp;
