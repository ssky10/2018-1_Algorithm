#include <stdio.h>
#include <math.h>
#include <Windows.h>
#include <glut.h>

#define MAX_SIZE 10
#define MAX_VALUE 3.402823466e+38F
#define POINT_MODE 0
#define LINE_MODE 1

typedef struct Point
{
	int x;
	int y;
} point;

typedef struct PointList {
	point p[MAX_SIZE];
	int num = 0;
} List;

typedef struct Stack
{
	int data[MAX_SIZE];
	int top = -1;
} Stack;

void InitDistance();
int getIdx(int i, int j);
int Spop(Stack* path);
void Spush(Stack* path, int d);
void TSP(List list, float sum, int now);

List list;
float distance[(((MAX_SIZE-1)*MAX_SIZE)/2)+1]; // _distance
Stack path;
Stack minpath;
int flag = POINT_MODE;
int visited = 1;
float min = MAX_VALUE;

void output(int x, int y, float r, float g, float b, void* font, char *string)
{
	glColor3f(r, g, b);
	glRasterPos2f(x, y);
	int len, i;
	len = (int)strlen(string);
	for (i = 0; i < len; i++) {
		glutBitmapCharacter(font, string[i]);
	}
}

void DoDisplay() {
	int i;
	char str[40];
	glClearColor(0.0, 0.0, 0.0, 1.0);
	glColor3f(0.0, 1.0, 0.0);

	glClear(GL_COLOR_BUFFER_BIT);
	glPointSize(5.0);
	glBegin(GL_POINTS);
	for (i = 0; i < list.num; i++) {
		glVertex2f(list.p[i].x, list.p[i].y);
	}
	glEnd();
	for (i = 0; i < list.num; i++) {
		glPushMatrix();
		sprintf_s(str, "(%d,%d)", list.p[i].x, list.p[i].y);
		output(list.p[i].x-10, list.p[i].y+10, 1.0, 1.0, 1.0, GLUT_BITMAP_8_BY_13, str);
		glPopMatrix();
	}
	
	if (flag == LINE_MODE) {
		glColor3f(1.0, 1.0, 1.0);
		glLineWidth(3);
		glBegin(GL_LINE_LOOP);
		glVertex2f(list.p[0].x, list.p[0].y);
		for (int i = 0; i <= minpath.top; i++) {
			int idx = minpath.data[i];
			glVertex2f(list.p[idx].x, list.p[idx].y);
		}
		glEnd();
		glPushMatrix();
		sprintf_s(str, "Shortest Path Length : %f", min);
		output(2, 485, 1.0, 1.0, 1.0, GLUT_BITMAP_8_BY_13, str);
		glPopMatrix();
	}
	glFlush();
}

void MyReShape(int w, int h) {
	glViewport(0, 0, w, h);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	glOrtho(0, 1000, 0, 500, -1, 1);
}

void MyMouse(int button, int state, int x, int y) {
	if (button == GLUT_LEFT_BUTTON && state == GLUT_DOWN) {
		int count = list.num;
		if (flag == LINE_MODE) {

		}else if(count == MAX_SIZE) {
			char msg[99];
			sprintf_s(msg, "최대 %d개의 점만 생성가능합니다.!!", MAX_SIZE);
			MessageBox( nullptr, TEXT(msg), TEXT( "오류" ), MB_OK );
		}
		else {
			list.p[count].x = x;
			list.p[count].y = 500 - y;
			list.num++;
		}
	}
	DoDisplay();
}

void reset() {
	list.num = 0;
	path.top = -1;
	minpath.top = -1;
	visited = 1;
	min = MAX_VALUE;
	for (int i = 0; i < ((MAX_SIZE - 1)*MAX_SIZE) / 2; i++) {
		distance[i] = 0.0;
	}
	flag = POINT_MODE;
}

void MyMainMenu(int entryID) {
	if (entryID == 1) {
		reset();
	}else if (entryID == 2) {
		InitDistance();
		TSP(list, 0, 0);
		flag = LINE_MODE;
	}
	DoDisplay();
}

void InitDistance() {
	int i, j, idx = 0;
	for (i = 1; i < list.num; i++) {
		for (j = 0; j < i; j++) {
			distance[idx] = sqrt(pow((list.p[i].x - list.p[j].x), 2) + pow((list.p[i].y - list.p[j].y), 2));
			idx++;
		}
	}
	distance[idx] = 0;
}

int Spop(Stack* _path) {
	if (_path->top == -1) return -1;
	return _path->data[(_path->top)--];
}

void Spush(Stack* _path, int d) {
	if (_path->top > MAX_SIZE) return;
	_path->data[++_path->top] = d;
}

void copy_stack(Stack* oldstack, Stack* newstack) {
	newstack->top = oldstack->top;
	for (int i = 0; i <= newstack->top; i++) {
		newstack->data[i] = oldstack->data[i];
	}
}

void TSP(List list, float sum, int now) {
	int i, oldVisited;

	if (visited == (1 << list.num)-1) {
		sum = sum + distance[getIdx(now, 0)];
		if (min > sum) {
			min = sum;
			copy_stack(&path, &minpath);
		}
		return;
	}

	for (i = 0; i < list.num; i++) {
		if (!(visited&(1 << i))) {
			oldVisited = visited;
			visited = visited | (1 << i);
			Spush(&path,i);
			TSP(list, sum + distance[getIdx(now, i)], i);
			visited = oldVisited;
			Spop(&path);
		}
	}	
}

int getIdx(int i, int j) {
	if (i == j) return ((list.num-1)*list.num)/2;
	if (i < j) return ((j - 1)*j) / 2 + i;
	else return ((i - 1)*i) / 2 + j;
}

void MyInit() {
	glutInitDisplayMode(GLUT_SINGLE | GLUT_RGBA);
	glutInitWindowSize(1000, 500);
	glutInitWindowPosition(100, 100);
	glutCreateWindow("2014011005 강현석");
	glutDisplayFunc(DoDisplay);
	glutReshapeFunc(MyReShape);
	glutMouseFunc(MyMouse);

	GLint MyMainMenuID = glutCreateMenu(MyMainMenu);
	glutAddMenuEntry("점 초기화", 1);
	glutAddMenuEntry("최단 경로 그리기", 2);

	glutAttachMenu(GLUT_RIGHT_BUTTON);

	glutMainLoop();
}

int main(int argc, char **argv) {
	glutInit(&argc, argv);
	MyInit();
	return 0;
}