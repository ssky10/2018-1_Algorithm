class _Node {
    constructor(point, weight) {
        this.point = point;
        this.weight = weight;
        this.next = null;
    }
}

class _Edge {
    constructor() {
        this.start = null;
        this.weight = -1;
    }
}

G = new Array(7);
var tree = new Array(7);
var distance = new Array(7);
var canvas = null;

$(function() {
    canvas = document.getElementById("mainCanvas");
    if (canvas.getContext) {
        // 캔버스를 지원하면 캔버스를 설정한다.
        reset(canvas)
    } else {
        // 캔버스를 지원하지 않을 경우 내용. (여기서는 경고창을 띄워준다.)
        alert("캔버스를 지원하지 않습니다.");
    }
});

function drow_node(canvas) {
    var ctx = canvas.getContext("2d");
    for (var i = 0; i < 5; i++) {
        if (i % 2 == 0) {
            ctx.beginPath();
            ctx.arc(250, 50 + 100 * i, 25, 0, Math.PI * 2, true);
            ctx.fillStyle = '#000000'
            ctx.fill();
            ctx.fillStyle = '#ffffff'
            ctx.font = '25px serif';
            ctx.fillText(i + (i / 2) + '', 245, 60 + 100 * i);
        } else {
            ctx.beginPath();
            ctx.arc(125, 50 + 100 * i, 25, 0, Math.PI * 2, true);
            ctx.fillStyle = '#000000'
            ctx.fill();
            ctx.fillStyle = '#ffffff'
            ctx.font = '25px serif';
            ctx.fillText(i + (i / 2) - 0.5 + '', 120, 60 + 100 * i);

            ctx.beginPath();
            ctx.arc(375, 50 + 100 * i, 25, 0, Math.PI * 2, true);
            ctx.fillStyle = '#000000'
            ctx.fill();
            ctx.fillStyle = '#ffffff'
            ctx.font = '25px serif';
            ctx.fillText(i + (i / 2) + 0.5 + '', 370, 60 + 100 * i);
        }
    }
}

function reset(canvas) {
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.weight, canvas.height);
    drow_node(canvas);
}

function click_btn() {
    box = $('#textbox');
    text = box.val();
    save_tree(text);
    drow_lines(G, '#000000');
    drow_node(canvas);
    //box.removeAttr('disabled');
    box.attr('disabled', "disabled");
    $('#next_btn').attr("onclick", "").unbind("click");
    $('#next_btn').bind("click", function() {
        Prim(G)
    });
}

function click_cancel_btn() {
    document.getElementById("canvasList").innerHTML = "";
    var cav = document.createElement("canvas");
    cav.id = "mainCanvas";
    cav.width = "500";
    cav.height = "500";

    document.getElementById("canvasList").appendChild(cav);
    box = $('#textbox');
    box.removeAttr('disabled');

    $('#next_btn').attr("onclick", "").unbind("click");
    $('#next_btn').bind("click", function() {
        click_btn()
    });

    canvas = document.getElementById("mainCanvas");
    G = new Array(7);
    tree = new Array(7);
    distance = new Array(7);
    reset(canvas);
}

function save_next_node(Graph, start, end, weight) {
    if (Graph[start] == null) {
        Graph[start] = new _Node(end, weight);
    } else {
        var node = Graph[start];
        if (node.point == end) return;
        while (node.next != null) {
            node = node.next;
            if (node.point == end) return;
        }
        node.next = new _Node(end, weight);
    }
}

function save_tree(str) {
    var count_paren = 0; //괄호의 개수
    var start_Node_num = null;
    var end_Node_num = null;
    var weight_num = null;
    var tmp = "";
    var flag = 0;
    //var count_comma = 0;
    for (var i = 0; i < str.length; i++) {
        switch (str.charAt(i)) {
            case '(':
                if (count_paren == 0) {
                    start_Node_num = Number(tmp);
                    tmp = "";
                } else if (count_paren == 1) {
                    end_Node_num = Number(tmp);
                    tmp = "";
                } else {
                    flag = 1;
                }
                count_paren++;
                break;
            case ')':
                count_paren--;
                if (count_paren == 0) {
                    start_Node_num = null;
                } else if (count_paren == 1) {
                    weight_num = Number(tmp);
                    console.log(start_Node_num, "  ", end_Node_num, "  ", weight_num);
                    save_next_node(G, start_Node_num, end_Node_num, weight_num);
                    save_next_node(G, end_Node_num, start_Node_num, weight_num);
                    end_Node_num = null;
                    weight_num = null;
                    tmp = "";
                } else {
                    flag = 1;
                }
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                tmp += str.charAt(i);
            default:
                break;
        }
        if (flag != 0) break;
    }
}

function drow_lines(Graph, color) {
    for (let index = 0; index < Graph.length; index++) {
        node = Graph[index];
        while (node != null) {
            if (index < node.point) {
                drow_line(index, node.point, node.weight, color);
            }
            node = node.next;
        }

    }
}

function drow_line(start, end, weight, color) {
    var context = canvas.getContext("2d");
    var start_xy = getCenterPoint(start);
    var end_xy = getCenterPoint(end);
    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(start_xy[0], start_xy[1]);
    if (start + end == 6) {
        var cp1xy;
        switch (Math.abs(start - end)) {
            case 2:
                cp1xy = getCenterPoint(1);
                break;
            case 4:
                cp1xy = getCenterPoint(4);
                break;
            case 6:
                cp1xy = getCenterPoint(5);
                cp1xy[1] = 250;
            default:
                break;
        }
        context.quadraticCurveTo(cp1xy[0], cp1xy[1], end_xy[0], end_xy[1]);
        //console.log(cp1x," ", cp1y);
    } else {
        context.lineTo(start_xy[0], start_xy[1]);
        context.lineTo(end_xy[0], end_xy[1]);
        context.closePath();
    }
    context.stroke();
}

function getCenterPoint(i) {
    if (i % 3 == 0) {
        return new Array(250, 50 + 200 * parseInt(i / 3));
    } else if (i % 3 == 1) {
        return new Array(125, 150 + 200 * parseInt(i / 3));
    } else {
        return new Array(375, 150 + 200 * parseInt(i / 3));
    }
}

function addCanvase(i) {
    var cav = document.createElement("canvas");
    cav.id = "canvas" + i;
    cav.width = "500";
    cav.height = "500";

    document.getElementById("canvasList").appendChild(cav);
}

function Prim(graph) {
    var start = 0;
    while (graph[start] == null) {
        start++;
        if (start >= 7) return;
    }

    for (let index = 0; index < 7; index++) {
        distance[index] = new _Node();
    }

    distance[start].weight = 0;
    for (let i = 1; i < 7; i++) {
        deleteMin(G, tree, distance, start);
        select = null;
        var min_weight = -1;
        var min_start = 0;
        var min_end = 0;
        for (var j = 0; j < tree.length; j++) {
            if (tree[j] == null && distance[j].weight != -1) {
                if ((min_weight <= 0) || (min_weight > distance[j].weight)) {
                    min_weight = distance[j].weight;
                    min_end = j;
                    min_start = distance[j].point;
                }
            }
        }
        save_next_node(tree, min_start, min_end, min_weight);
        save_next_node(tree, min_end, min_start, min_weight);
        addCanvase(i);
        canvas = document.getElementById("canvas" + i);
        drow_lines(G, '#000000');
        drow_lines(tree, '#ff0000');
        reset(canvas)

        start = min_end;
    }
}

function deleteMin(graph, Q, d, start) {
    var node = graph[start];
    while (node != null) {
        if (Q[node.point] == null) {
            if ((d[node.point].weight < 0) || (d[node.point].weight > node.weight)) {
                d[node.point].weight = node.weight;
                d[node.point].point = start;
            }
        }
        node = node.next;
    }
}