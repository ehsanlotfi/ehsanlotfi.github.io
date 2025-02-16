
function generateGuid()
{
    const hexDigits = '0123456789abcdef';
    let guid = '';

    for (let i = 0; i < 36; i++)
    {
        if (i === 8 || i === 13 || i === 18 || i === 23)
        {
            guid += '-';
        } else if (i === 14)
        {
            guid += '4';
        } else if (i === 19)
        {
            guid += hexDigits[(Math.random() * 4) | 8];
        } else
        {
            guid += hexDigits[Math.floor(Math.random() * 16)];
        }
    }

    return guid;
}

function flattenNestedItemsWithParentPath(data)
{
    let flatData = [];

    function flatten(item, parent = "")
    {
        item.id = generateGuid();

        const itemWithPath = { ...item, parent };
        flatData.push(itemWithPath);

        if (item.children && item.children.length)
        {
            item.children.forEach((child) =>
            {
                flatten(child, itemWithPath.id);
            });
        }
    }

    data.forEach(flatten);

    return flatData;
}

function drawChart(data)
{
    Highcharts.chart('container', {
        series: [{
            name: 'Regions',
            type: 'treemap',
            layoutAlgorithm: 'squarified',
            allowDrillToNode: true,
            animationLimit: 1000,
            dataLabels: {
                enabled: false
            },
            levels: [{
                level: 1,
                dataLabels: {
                    enabled: true,
                    style: {
                        fontSize: '20px'
                    }
                },
                borderWidth: 3,
                levelIsConstant: false
            }],
            accessibility: {
                exposeAsGroupOnly: true
            },
            data
        }],
        subtitle: { text: '' },
        title: { text: '' }
    });
}

Highcharts.getJSON('./data.json', function (data)
{
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/vnd.github.v3+json");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    const repos = data.map(f => f.children).flat().filter(f => f && f.repo).map(f => `repo:${f.repo}`);


    fetch(`https://api.github.com/search/repositories?q=${repos.join("+")}&sort=stars&order=desc&per_page=${repos.length}`, requestOptions)
        .then(response => response.json())
        .then(result =>
        {
            let flatData = flattenNestedItemsWithParentPath(data);
            colorsIndex = [...new Set(flatData.filter(f => f.parent.length == 36).map(f => f.parent))];

            flatData.forEach(element =>
            {
                const finded = result.items.find(f => element.repo == f.full_name);
                if (finded)
                {
                    element.meta = finded;
                    element.value = finded.stargazers_count;
                    element.color = Highcharts.getOptions().colors[colorsIndex.findIndex(f => f == element.parent)]
                }

            });

            drawChart(flatData);

        })
        .catch(error => console.log('error', error));
});
