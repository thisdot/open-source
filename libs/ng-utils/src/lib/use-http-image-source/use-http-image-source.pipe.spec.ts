import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { UseHttpImageSourcePipeModule } from './use-http-image-source-pipe.module';
import { UseHttpImageSourcePipe } from './use-http-image-source.pipe';

const MOCK_CDR = {
  markForCheck: jest.fn(),
};

describe('UseHttpImageSourcePipe', () => {
  let pipe: UseHttpImageSourcePipe;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:testblob.png');
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        UseHttpImageSourcePipeModule.forRoot({
          loadingImagePath: 'test/loading.png',
          errorImagePath: 'test/error.png',
        }),
      ],
      providers: [
        UseHttpImageSourcePipe,
        {
          provide: ChangeDetectorRef,
          useValue: MOCK_CDR,
        },
      ],
    }).compileComponents();

    pipe = TestBed.inject(UseHttpImageSourcePipe);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    pipe.ngOnDestroy();
    jest.resetAllMocks();
  });

  it(
    `when receives a falsy value, it returns the error image path`,
    waitForAsync(() => {
      const result = pipe.transform('');
      expect(result).toEqual('test/error.png');
    })
  );

  it(`Initially it returns with the loading image path`, fakeAsync(() => {
    const result = pipe.transform('test/something.png');
    expect(result).toEqual('test/loading.png');
  }));

  it(`Sends a requests using the httpClient`, fakeAsync(() => {
    const result = pipe.transform('test/something.png');
    expect(result).toEqual('test/loading.png');

    tick(100);
    httpMock
      .expectOne(`test/something.png`, 'should hit test/something.png')
      .flush(new Blob(['something']));

    tick(100);
    expect(MOCK_CDR.markForCheck).toHaveBeenCalled();
    const updatedResult = pipe.transform('test/something.png');
    expect(updatedResult).toEqual({ changingThisBreaksApplicationSecurity: 'blob:testblob.png' });
  }));

  it(`returns the error image path when the request returns with an error`, fakeAsync(() => {
    const result = pipe.transform('test/something.png');
    expect(result).toEqual('test/loading.png');

    tick(100);
    httpMock
      .expectOne(`test/something.png`, 'should hit test/something.png')
      .error(new ErrorEvent('unauthorized'));

    tick(100);
    expect(MOCK_CDR.markForCheck).toHaveBeenCalled();
    const updatedResult = pipe.transform('test/something.png');
    expect(updatedResult).toEqual('test/error.png');
  }));

  it(`Sends a requests using the httpClient when the input value changes`, fakeAsync(() => {
    const result = pipe.transform('test/something.png');
    expect(result).toEqual('test/loading.png');

    tick(100);
    httpMock
      .expectOne(`test/something.png`, 'should hit test/something.png')
      .flush(new Blob(['something']));

    tick(100);
    expect(MOCK_CDR.markForCheck).toHaveBeenCalledTimes(1);
    const updatedResult = pipe.transform('test/something.png');
    expect(updatedResult).toEqual({ changingThisBreaksApplicationSecurity: 'blob:testblob.png' });

    pipe.transform('test/something_else.png');

    tick(100);
    httpMock
      .expectOne(`test/something_else.png`, 'should hit test/something_else.png')
      .flush(new Blob(['something']));
    expect(MOCK_CDR.markForCheck).toHaveBeenCalledTimes(2);
    const secondResult = pipe.transform('test/something_else.png');
    expect(secondResult).toEqual({ changingThisBreaksApplicationSecurity: 'blob:testblob.png' });
  }));
});
