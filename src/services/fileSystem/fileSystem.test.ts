import { FileSystemService } from '.';

describe('FileSystemService', () => {
  let fsService: FileSystemService;

  beforeEach(async () => {
    fsService = new FileSystemService();
  });

  it('should be defined', () => {
    expect(fsService).toBeDefined();
  });
  describe('checkIfFileExists', () => {
    it('should return true when the passed path points to an existing file', async () => {
      const res = await fsService.checkIfFileExists('./package.json');
      expect(res).toBe(true);
    });

    it('should return false when the passed path points to an non-existing file', async () => {
      const res = await fsService.checkIfFileExists(
        './non-existing-file-example.json',
      );
      expect(res).toBe(false);
    });
  });
});
