/**
 * @file font icon
 * @date 2021-08-09
 * @author xuejie.he
 * @lastModify xuejie.he 2021-08-09
 */

export interface IconDefinition {
    iconName: string;
    prefix?: string;
    icon: [number, number, never[], string, string];
}

export const dropdown: IconDefinition = {
    iconName: 'dropdown',
    icon: [
        1737,
        1024,
        [],
        '59296',
        'M858.77317374 859.57874545a54.40251331 54.40251331 0 0 1-40.62054303-18.1341711l-522.26412761-580.29347527a54.40251331 54.40251331 0 0 1 81.24108605-72.53668442l481.64358459 535.32073076 493.24945344-536.04609721a54.40251331 54.40251331 0 1 1 79.79035311 72.5366844l-529.51779632 580.29347459a55.12788045 55.12788045 0 0 1-43.52201023 18.85953825z',
    ],
};

export default {
    dropdown,
};
