import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { UseHttpImageSourcePipeModule } from './use-http-image-source-pipe.module';
import { UseHttpImageSourcePipe } from './use-http-image-source.pipe';

const MOCK_CDR = {
  markForCheck: jest.fn(),
};

describe('UseHttpImageSourcePipe', () => {
  let pipe: UseHttpImageSourcePipe;
  let httpMock: HttpTestingController;
  let domSanitizer: DomSanitizer;
  let createObjectURLMock: jest.Mock;

  beforeEach(() => {
    createObjectURLMock = jest.fn().mockReturnValue('blob:testblob.png');
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = jest.fn();
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
    domSanitizer = TestBed.inject(DomSanitizer);
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
    expect(updatedResult).toEqual(domSanitizer.bypassSecurityTrustUrl('blob:testblob.png'));
  }));

  it(`Sends second request when url changes`, fakeAsync(() => {
    const result = pipe.transform('test/something.png');
    expect(result).toEqual('test/loading.png');

    tick(100);
    const resultBlob = new Blob(['something']);
    httpMock.expectOne(`test/something.png`, 'should hit test/something.png').flush(resultBlob);

    tick(100);
    expect(MOCK_CDR.markForCheck).toHaveBeenCalled();
    const updatedResult = pipe.transform('test/something.png');
    expect(updatedResult).toEqual(domSanitizer.bypassSecurityTrustUrl('blob:testblob.png'));

    createObjectURLMock.mockReturnValue('blob:test-different-blob.png');
    pipe.transform('test/something-different.png');
    tick(100);
    const secondResult = pipe.transform('test/something-different.png');
    expect(secondResult).toEqual('test/loading.png');

    tick(100);
    const resultSecondBlob = new Blob(['something different']);
    httpMock
      .expectOne('test/something-different.png', 'should hit test/something-different.png')
      .flush(resultSecondBlob);

    const updatedSecondResult = pipe.transform('test/something-different.png');
    expect(updatedSecondResult).toEqual(
      domSanitizer.bypassSecurityTrustUrl('blob:test-different-blob.png')
    );
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
    expect(updatedResult).toEqual(domSanitizer.bypassSecurityTrustUrl('blob:testblob.png'));

    pipe.transform('test/something_else.png');

    tick(100);
    httpMock
      .expectOne(`test/something_else.png`, 'should hit test/something_else.png')
      .flush(new Blob(['something']));
    expect(MOCK_CDR.markForCheck).toHaveBeenCalledTimes(2);
    const secondResult = pipe.transform('test/something_else.png');
    expect(secondResult).toEqual(domSanitizer.bypassSecurityTrustUrl('blob:testblob.png'));
  }));

  it(`Creates Object Url when receives value from HttpClient`, fakeAsync(() => {
    const result = pipe.transform('test/something.png');
    expect(result).toEqual('test/loading.png');

    const resultBlob = new Blob(['something']);

    tick(100);
    httpMock.expectOne(`test/something.png`, 'should hit test/something.png').flush(resultBlob);

    tick(100);
    expect(MOCK_CDR.markForCheck).toHaveBeenCalled();
    const updatedResult = pipe.transform('test/something.png');
    expect(updatedResult).toEqual(domSanitizer.bypassSecurityTrustUrl('blob:testblob.png'));

    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(resultBlob);
  }));

  it(`Revokes created Object Url when pipe is destroyed`, fakeAsync(() => {
    const result = pipe.transform('test/something.png');
    expect(result).toEqual('test/loading.png');

    const resultBlob = new Blob(['something']);

    tick(100);
    httpMock.expectOne(`test/something.png`, 'should hit test/something.png').flush(resultBlob);

    tick(100);
    expect(MOCK_CDR.markForCheck).toHaveBeenCalled();
    const updatedResult = pipe.transform('test/something.png');
    expect(updatedResult).toEqual(domSanitizer.bypassSecurityTrustUrl('blob:testblob.png'));

    pipe.ngOnDestroy();

    expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:testblob.png');
  }));

  it(`Revokes created Object Url when pipe second image is loaded`, fakeAsync(() => {
    const result = pipe.transform('test/something.png');
    expect(result).toEqual('test/loading.png');

    const resultBlob = new Blob(['something']);
    const resultSecondBlob = new Blob(['something different']);

    tick(100);
    httpMock.expectOne(`test/something.png`, 'should hit test/something.png').flush(resultBlob);

    tick(100);
    expect(MOCK_CDR.markForCheck).toHaveBeenCalled();
    const updatedResult = pipe.transform('test/something.png');
    expect(updatedResult).toEqual(domSanitizer.bypassSecurityTrustUrl('blob:testblob.png'));

    createObjectURLMock.mockReturnValue('blob:test-different-blob.png');
    pipe.transform('test/something-different.png');

    tick(100);
    httpMock
      .expectOne('test/something-different.png', 'should hit test/something-different.png')
      .flush(resultSecondBlob);

    expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:testblob.png');
  }));
});
