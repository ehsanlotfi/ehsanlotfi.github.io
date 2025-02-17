import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Highcharts from "highcharts";
import TreemapModule from "highcharts/modules/treemap";
import { Link } from "react-router-dom";

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

    const { category } = useParams();
    const chartContainerRef = useRef(null);

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

                const repos = data
                    .filter((f) => f && f.repo)
                    .map((f) => `repo:${f.repo}`);

                return fetch(
                    `https://api.github.com/search/repositories?q=${repos.join("+")}&sort=stars&order=desc&per_page=${repos.length}`,
                    requestOptions
                )
                    .then((res) => res.json())
                    .then((result) =>
                    {
                        let flatData = flattenNestedItemsWithParentPath(data);
                        let colorsIndex = [
                            ...new Set(flatData.filter((f) => f.parent.length === 36).map((f) => f.parent)),
                        ];

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
                data: chartData.map((item, index) => ({
                    ...item,
                    color: Highcharts.color(Highcharts.getOptions().colors[index % Highcharts.getOptions().colors.length])
                        .brighten(Math.random() * 0.5 - 0.25) // Random brightness variation
                        .get()
                })),
            }]
        }

        );

        return () => chart.destroy(); // Cleanup to avoid memory leaks
    }, [chartData]);

    return (
        <div>
            <Link className="back-btn" to={'/'}>⮈</Link>
            <div className="chart-container" ref={chartContainerRef}></div>
        </div>
    );
};

export default TreeChart;
