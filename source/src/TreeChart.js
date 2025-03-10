import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Highcharts from "highcharts";
import TreemapModule from "highcharts/modules/treemap";
import { Link } from "react-router-dom";
import { Offcanvas } from "bootstrap";
import MarkdownRenderer from "./MarkdownRenderer";

if (typeof TreemapModule === "function")
{
    TreemapModule(Highcharts);
}

const generateGuid = () =>
{
    const hexDigits = "0123456789abcdef";
    let guid = "";

    for (let i = 0; i < 36; i++)
    {
        if (i === 8 || i === 13 || i === 18 || i === 23)
        {
            guid += "-";
        } else if (i === 14)
        {
            guid += "4";
        } else if (i === 19)
        {
            guid += hexDigits[(Math.random() * 4) | 8];
        } else
        {
            guid += hexDigits[Math.floor(Math.random() * 16)];
        }
    }

    return guid;
};

// تابع تبدیل داده‌های تو در تو به لیست تخت
const flattenNestedItemsWithParentPath = (data) =>
{
    let flatData = [];

    const flatten = (item, parent = "") =>
    {
        item.id = generateGuid();
        const itemWithPath = { ...item, parent };
        flatData.push(itemWithPath);

        if (item.children && item.children.length)
        {
            item.children.forEach((child) => flatten(child, itemWithPath.id));
        }
    };

    data.forEach(flatten);
    return flatData;
};

const TreeChart = () =>
{
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markdownUrl, setMarkdownUrl] = useState(true);

    const { category } = useParams();
    const chartContainerRef = useRef(null);

    const offcanvasRef = useRef(null);

    const toggleOffcanvas = (fullName) =>
    {
        setMarkdownUrl(`https://raw.githubusercontent.com/${fullName}/main/README.md`);
        const offcanvas = new Offcanvas(offcanvasRef.current);
        offcanvas.toggle();
    };

    useEffect(() =>
    {
        fetch(`/data/${category}.json`)
            .then((res) => res.json())
            .then((data) =>
            {
                const requestOptions = {
                    method: "GET",
                    headers: { Accept: "application/vnd.github.v3+json" },
                };

                var repos = [];
                if (data[0].children && data[0].children.length)
                {
                    repos = data
                        .map(f => f.children).flat()
                        .filter((f) => f && f.repo)
                        .map((f) => `repo:${f.repo}`);
                } else
                {
                    repos = data
                        .filter((f) => f && f.repo)
                        .map((f) => `repo:${f.repo}`);
                }

                let flatData = flattenNestedItemsWithParentPath(data);
                let colorsIndex = [
                    ...new Set(flatData.filter((f) => f.parent.length === 36).map((f) => f.parent)),
                ];

                // setChartData(flatData);
                // setLoading(false);

                return fetch(
                    `https://api.github.com/search/repositories?q=${repos.join("+")}&sort=stars&order=desc&per_page=${repos.length}`,
                    requestOptions
                )
                    .then((res) => res.json())
                    .then((result) =>
                    {
                        flatData.forEach((element) =>
                        {
                            const foundRepo = result.items.find((f) => element.repo === f.full_name);
                            if (foundRepo)
                            {
                                element.meta = foundRepo;
                                element.value = foundRepo.stargazers_count;
                                element.color =
                                    Highcharts.getOptions().colors[colorsIndex.findIndex((f) => f === element.parent)];
                            }
                        });

                        setChartData(flatData);
                        setLoading(false);
                    });

            })
            .catch((error) =>
            {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    }, [category]);

    useEffect(() =>
    {

        const toggleOffcanvasRef = toggleOffcanvas;

        if (!chartContainerRef.current) return;

        const chart = Highcharts.chart(chartContainerRef.current, {
            chart: {
                backgroundColor: "#1e1e1e",
                style: { color: "#ffffff" }
            },
            title: {
                text: '',
                style: { color: "#ffffff" }
            },
            subtitle: {
                text: '',
                style: { color: "#aaaaaa" }
            },
            xAxis: {
                gridLineColor: "#444",
                labels: { style: { color: "#ffffff" } },
                title: { style: { color: "#ffffff" } },
            },
            yAxis: {
                gridLineColor: "#444",
                labels: { style: { color: "#ffffff" } },
                title: { style: { color: "#ffffff" } },
            },
            legend: {
                itemStyle: { color: "#ffffff" },
                itemHoverStyle: { color: "#aaaaaa" },
            },
            tooltip: {
                backgroundColor: "#333",
                style: { color: "#ffffff" }
            },
            plotOptions: {
                series: {
                    events: {
                        click: function (event)
                        {
                            if (toggleOffcanvasRef && !(event.point && event.point.children && event.point.children.length))
                            {
                                toggleOffcanvasRef(event.point.meta.full_name);
                            }
                        }
                    }
                },
                treemap: {
                    borderColor: "#666"
                }
            },
            series: [{
                name: 'Regions',
                type: 'treemap',
                layoutAlgorithm: 'squarified',
                allowDrillToNode: true,
                animationLimit: 1000,
                dataLabels: {
                    enabled: true,
                    style: {
                        fontSize: '14px',
                        color: "#ffffff"
                    }
                },
                levels: [{
                    level: 1,
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '20px',
                            color: "#ffffff"
                        }
                    },
                    borderWidth: 3,
                    levelIsConstant: false
                }],
                accessibility: {
                    exposeAsGroupOnly: true
                },
                data: chartData
            }]
        }

        );

        return () => chart.destroy(); // Cleanup to avoid memory leaks
    }, [chartData]);

    return (
        <div>
            <Link className="back-btn" to={'/'}><img src="/back-icon.png"></img></Link>
            {loading ? (
                <div className="chart-loading-container">
                    <img src="/loading.gif"></img>
                </div>
            ) : (
                <>
                    <div className="chart-container" ref={chartContainerRef}></div>
                    <div
                        ref={offcanvasRef}
                        className="offcanvas offcanvas-end"
                        tabIndex="-1"
                        id="offcanvasRight"
                        aria-labelledby="offcanvasRightLabel"
                    >
                        <div className="offcanvas-header">
                            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div className="offcanvas-body p-0">
                            <MarkdownRenderer url={markdownUrl} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TreeChart;
