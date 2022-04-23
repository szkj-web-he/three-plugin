import React, { Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { listenToParentIPC, render } from './boilerplate';
import './normalize.scss';
import './font.scss';
import './style.scss';
listenToParentIPC();

const tabData = [
    {
        title: 'Earth',
        element: React.lazy(() => import('./Earth')),
        id: 1,
    },
    {
        title: 'Basic Mouse Interaction',
        element: React.lazy(() => import('./BasicMouseInteraction')),
        id: 2,
    },
    {
        title: 'Axial Mouse Interaction',
        element: React.lazy(() => import('./AxialMouseInteraction')),
        id: 3,
    },
    {
        title: 'Basic Maze',
        element: React.lazy(() => import('./BasicMaze')),
        id: 4,
    },
    {
        title: 'Gravity Maze',
        element: React.lazy(() => import('./GravityMaze')),
        id: 5,
    },
    {
        title: 'Die',
        element: React.lazy(() => import('./Die')),
        id: 6,
    },
    {
        title: 'Tomography',
        element: React.lazy(() => import('./Tomography')),
        id: 7,
    },
    {
        title: 'Volume Selector',
        element: React.lazy(() => import('./Earth')),
        id: 8,
    },
    {
        title: 'Curiosity Rover (Clean)',
        element: React.lazy(() => import('./Earth')),
        id: 9,
    },
    {
        title: 'Curiosity Rover (Dirty)',
        element: React.lazy(() => import('./Earth')),
        id: 10,
    },
];

const Main: React.FC = () => {
    const [selectData, setSelectData] = useState<{
        title: string;
        element: React.LazyExoticComponent<() => JSX.Element>;
        id: number;
    }>();

    useLayoutEffect(() => {
        let data: {
            title: string;
            element: React.LazyExoticComponent<() => JSX.Element>;
            id: number;
        };
        if (window.location.search.includes('?')) {
            const paramStr = window.location.search.split('?')[1];
            const arr = paramStr.includes('&') ? paramStr.split('&') : [paramStr];
            const json: Record<string, string> = {};
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i].split('=');
                json[item[0]] = item[1];
            }
            const id = Number(json.id);

            data = tabData.find((item) => item.id === id) ?? { ...tabData[0] };
        } else {
            data = { ...tabData[0] };
        }
        setSelectData({ ...data });
    }, []);

    useEffect(() => {
        if (selectData) {
            window.history.pushState({}, '', `?id=${selectData?.id}`);
        }
    }, [selectData]);

    if (!selectData) return <>加载中....</>;

    const Temp = selectData.element;

    return (
        <div className="wrapper">
            <div className="nav">
                <div className="nav_title">Catalogue</div>
                <div className="nav_list">
                    {tabData.map((item) => {
                        return (
                            <div
                                className={`nav_item${item.id === selectData.id ? ' active' : ''}`}
                                key={item.id}
                                onClick={() => setSelectData({ ...item })}
                            >
                                {item.title}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="main">
                <Suspense fallback={<>加载中...</>}>
                    <Temp />
                </Suspense>
            </div>
        </div>
    );
};

render(<Main />);
