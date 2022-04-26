/**
 * @file icon
 * @date 2021-08-09
 * @author xuejie.he
 * @lastModify xuejie.he 2021-08-09
 */
/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React from 'react';
import iconType, { IconDefinition } from './Unit/customFontIcon';

import './style.scss';
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    /**
     * icon type
     */
    type?: keyof typeof iconType;
    /**
     * color of this component
     */
    color?: string;
    /**
     * fontSize of this component
     */
    fontSize?: string;
    /**
     * custom icon
     */
    icon?: IconDefinition;
    /**
     * title of this component
     */
    title?: string;
}

/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Icon: React.VFC<IconProps> = ({
    type,
    color,
    fontSize,
    style,
    className,
    icon,
    title,
    ...props
}) => {
    const iconData = type ? iconType[type] : icon;
    if (!iconData) {
        return <></>;
    }
    const classNameList = ['icon_wrap'];
    className && classNameList.push(className);

    return (
        <svg
            data-icon={iconData.iconName}
            focusable="false"
            aria-hidden="true"
            className={classNameList.join(' ')}
            viewBox={`0 0 ${iconData.icon[0]} ${iconData.icon[1]}`}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            style={Object.assign(
                {},
                style,
                fontSize && {
                    fontSize,
                },
                color && {
                    color,
                },
            )}
            {...props}
        >
            {title && <title>{title}</title>}
            <path fill="currentColor" d={iconData.icon[4]} />
        </svg>
    );

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
